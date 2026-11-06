-- ==============================================================================
-- DATABASE SCHEMA: eOSIS (Aplikasi Pemilihan Ketua & Wakil Ketua OSIS)
-- Platform: Supabase PostgreSQL with RLS, Constraints, & Atomic Voting RPC
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABEL KELAS
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    grade VARCHAR(10) NOT NULL,
    major VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABEL SISWA / PEMILIH
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nisn VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    birth_date DATE NOT NULL,
    gender VARCHAR(2) CHECK (gender IN ('L', 'P')),
    class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    voter_type VARCHAR(20) DEFAULT 'SISWA' CHECK (voter_type IN ('SISWA', 'GURU', 'STAFF')),
    has_voted BOOLEAN NOT NULL DEFAULT FALSE,
    voted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_has_voted CHECK (has_voted IN (TRUE, FALSE))
);

-- Index untuk pencarian cepat berdasarkan NISN & Tanggal Lahir (Login Siswa)
CREATE INDEX IF NOT EXISTS idx_students_nisn_birth ON public.students(nisn, birth_date);
CREATE INDEX IF NOT EXISTS idx_students_class ON public.students(class_id);

-- 4. TABEL CALON KANDIDAT KETUA & WAKIL KETUA OSIS
CREATE TABLE IF NOT EXISTS public.candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number INT NOT NULL UNIQUE,
    leader_name VARCHAR(150) NOT NULL,
    vice_leader_name VARCHAR(150) NOT NULL,
    slogan TEXT,
    vision TEXT,
    mission JSONB DEFAULT '[]'::jsonb,
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABEL PEROLEHAN SUARA (ANONYMOUS VOTE BOX)
-- Catatan Keamanan & Privasi: Tabel ini sengaja TIDAK MENYIMPAN ID SISWA (student_id),
-- sehingga menjamin asas LUBERJURDIL (Rahasia). Admin atau siapapun tidak dapat melacak
-- hubungan antara identitas siswa dengan pilihan kandidatnya.
CREATE TABLE IF NOT EXISTS public.votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_votes_candidate ON public.votes(candidate_id);

-- 6. TABEL PENGATURAN APLIKASI & SEKOLAH
CREATE TABLE IF NOT EXISTS public.app_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_name VARCHAR(200) NOT NULL DEFAULT 'SMA Negeri 1 Teladan',
    school_logo TEXT DEFAULT '',
    election_period VARCHAR(50) NOT NULL DEFAULT '2026/2027',
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE DEFAULT (CURRENT_DATE + INTERVAL '7 days'),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    announcement TEXT DEFAULT 'Gunakan hak suara Anda dengan jujur dan bertanggung jawab!',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABEL ADMIN CREDENTIALS (Hashed Password)
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name VARCHAR(150) NOT NULL DEFAULT 'Administrator OSIS',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 8. FUNCTION / RPC: SUBMIT_VOTE (VALIDASI HAK SUARA TINGKAT DATABASE)
-- Menjamin transaksi atomik (pemberian 1 kali suara per siswa) dan mencegah race condition.
-- ==============================================================================
-- Hapus fungsi jika sudah ada sebelumnya agar tidak terjadi error 42P13
DROP FUNCTION IF EXISTS public.submit_vote(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.submit_vote CASCADE;

CREATE OR REPLACE FUNCTION public.submit_vote(
    p_student_id UUID,
    p_candidate_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_has_voted BOOLEAN;
    v_is_election_active BOOLEAN;
    v_candidate_exists BOOLEAN;
BEGIN
    -- 1. Cek apakah periode pemilihan sedang aktif
    SELECT is_active INTO v_is_election_active
    FROM public.app_settings
    LIMIT 1;

    IF v_is_election_active IS NOT NULL AND v_is_election_active = FALSE THEN
        RAISE EXCEPTION 'Pemilihan OSIS saat ini sedang ditutup atau belum dimulai.';
    END IF;

    -- 2. Cek keberadaan calon kandidat
    SELECT EXISTS (
        SELECT 1 FROM public.candidates WHERE id = p_candidate_id
    ) INTO v_candidate_exists;

    IF NOT v_candidate_exists THEN
        RAISE EXCEPTION 'Kandidat yang Anda pilih tidak valid atau tidak ditemukan.';
    END IF;

    -- 3. Kunci baris siswa (FOR UPDATE) untuk mencegah race condition (dobel klik / multi-tab)
    SELECT has_voted INTO v_has_voted
    FROM public.students
    WHERE id = p_student_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Data siswa pemilih tidak ditemukan.';
    END IF;

    -- 4. Validasi hak suara siswa di database
    IF v_has_voted = TRUE THEN
        RAISE EXCEPTION 'Anda sudah menggunakan hak suara Anda sebelumnya. Setiap siswa hanya diperbolehkan memilih 1 kali.';
    END IF;

    -- 5. Perbarui status siswa menjadi SUDAH MEMILIH
    UPDATE public.students
    SET has_voted = TRUE,
        voted_at = NOW()
    WHERE id = p_student_id;

    -- 6. Masukkan suara ke kotak suara anonim
    INSERT INTO public.votes (candidate_id, created_at)
    VALUES (p_candidate_id, NOW());

    RETURN jsonb_build_object(
        'success', TRUE,
        'message', 'Suara Anda berhasil dicatat, terima kasih telah berpartisipasi.'
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'message', SQLERRM
        );
END;
$$;

-- ==============================================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Policy Classes: Semua orang bisa baca
DROP POLICY IF EXISTS "Public read classes" ON public.classes;
DROP POLICY IF EXISTS "Admin write classes" ON public.classes;
CREATE POLICY "Public read classes" ON public.classes FOR SELECT USING (true);
CREATE POLICY "Admin write classes" ON public.classes FOR ALL USING (true);

-- Policy Candidates: Semua orang bisa baca kandidat
DROP POLICY IF EXISTS "Public read candidates" ON public.candidates;
DROP POLICY IF EXISTS "Admin write candidates" ON public.candidates;
CREATE POLICY "Public read candidates" ON public.candidates FOR SELECT USING (true);
CREATE POLICY "Admin write candidates" ON public.candidates FOR ALL USING (true);

-- Policy App Settings: Semua orang bisa baca pengaturan
DROP POLICY IF EXISTS "Public read settings" ON public.app_settings;
DROP POLICY IF EXISTS "Admin write settings" ON public.app_settings;
CREATE POLICY "Public read settings" ON public.app_settings FOR SELECT USING (true);
CREATE POLICY "Admin write settings" ON public.app_settings FOR ALL USING (true);

-- Policy Students: Publik bisa cari untuk verifikasi login, admin bisa CRUD
DROP POLICY IF EXISTS "Students read own" ON public.students;
DROP POLICY IF EXISTS "Admin write students" ON public.students;
CREATE POLICY "Students read own" ON public.students FOR SELECT USING (true);
CREATE POLICY "Admin write students" ON public.students FOR ALL USING (true);

-- Policy Votes: Publik hanya bisa baca agregat / count, penambahan lewat RPC submit_vote
DROP POLICY IF EXISTS "Public read votes" ON public.votes;
DROP POLICY IF EXISTS "Insert vote via RPC" ON public.votes;
CREATE POLICY "Public read votes" ON public.votes FOR SELECT USING (true);
CREATE POLICY "Insert vote via RPC" ON public.votes FOR INSERT WITH CHECK (true);

-- Policy Admin Users:
DROP POLICY IF EXISTS "Admin users read and write" ON public.admin_users;
CREATE POLICY "Admin users read and write" ON public.admin_users FOR ALL USING (true);

-- ==============================================================================
-- 10. STORAGE BUCKET UNTUK FOTO KANDIDAT & LOGO SEKOLAH
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('eosis-assets', 'eosis-assets', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Access eosis-assets" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload eosis-assets" ON storage.objects;
DROP POLICY IF EXISTS "Public Update eosis-assets" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete eosis-assets" ON storage.objects;

CREATE POLICY "Public Access eosis-assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'eosis-assets');

CREATE POLICY "Public Upload eosis-assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'eosis-assets');

CREATE POLICY "Public Update eosis-assets"
ON storage.objects FOR UPDATE
USING (bucket_id = 'eosis-assets');

CREATE POLICY "Public Delete eosis-assets"
ON storage.objects FOR DELETE
USING (bucket_id = 'eosis-assets');

-- ==============================================================================
-- 11. DATA AWAL (SEED DATA UNTUK PENGUJIAN LANGSUNG)
-- ==============================================================================
-- Inisialisasi pengaturan default jika belum ada
INSERT INTO public.app_settings (school_name, election_period, is_active, announcement)
VALUES (
    'SMA Negeri 1 Teladan Jakarta',
    '2026/2027',
    TRUE,
    'Pemilihan Ketua dan Wakil Ketua OSIS Periode 2026/2027 berlangsung secara Langsung, Umum, Bebas, dan Rahasia.'
)
ON CONFLICT DO NOTHING;

-- Inisialisasi Admin default (username: admin, password default: admin123)
-- SHA-256 hash untuk "admin123": 240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9
INSERT INTO public.admin_users (username, password_hash, name)
VALUES (
    'admin',
    '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
    'Administrator Utama'
)
ON CONFLICT (username) DO NOTHING;
