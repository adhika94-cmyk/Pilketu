<template>
  <div class="d-flex min-vh-100">
    <!-- Sidebar -->
    <AdminSidebar :is-open="sidebarOpen" @close="sidebarOpen = false" />

    <!-- Main Content -->
    <div class="admin-content flex-grow-1">
      <!-- Topbar -->
      <header class="admin-topbar d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center gap-3">
          <button class="btn btn-light d-lg-none border" @click="sidebarOpen = !sidebarOpen">
            <i class="bi bi-list fs-5"></i>
          </button>
          <div>
            <h4 class="fw-bold text-dark mb-0 fs-5">Pengaturan Aplikasi</h4>
            <span class="text-muted small">Konfigurasi identitas sekolah, periode, akun admin, dan database Supabase</span>
          </div>
        </div>
      </header>

      <!-- Content Area -->
      <main class="p-4 flex-grow-1">
        <!-- Notification Alert -->
        <div v-if="alertMessage" class="alert alert-success alert-dismissible fade show rounded-3 p-3 mb-4 shadow-sm" role="alert">
          <i class="bi bi-check-circle-fill me-2"></i> {{ alertMessage }}
          <button type="button" class="btn-close" @click="alertMessage = ''"></button>
        </div>

        <div v-if="errorMessage" class="alert alert-danger alert-dismissible fade show rounded-3 p-3 mb-4 shadow-sm" role="alert">
          <i class="bi bi-exclamation-triangle-fill me-2"></i> {{ errorMessage }}
          <button type="button" class="btn-close" @click="errorMessage = ''"></button>
        </div>

        <!-- Navigation Tabs -->
        <ul class="nav nav-pills mb-4 bg-white p-2 rounded-4 border shadow-sm gap-2">
          <li class="nav-item">
            <button
              class="nav-link rounded-3 fw-semibold small"
              :class="{ 'active': activeTab === 'school' }"
              @click="activeTab = 'school'"
            >
              <i class="bi bi-building me-1"></i> Identitas & Periode Sekolah
            </button>
          </li>
          <li class="nav-item">
            <button
              class="nav-link rounded-3 fw-semibold small"
              :class="{ 'active': activeTab === 'admin' }"
              @click="activeTab = 'admin'"
            >
              <i class="bi bi-shield-lock me-1"></i> Keamanan Akun Admin
            </button>
          </li>
          <li class="nav-item">
            <button
              class="nav-link rounded-3 fw-semibold small"
              :class="{ 'active': activeTab === 'supabase' }"
              @click="activeTab = 'supabase'"
            >
              <i class="bi bi-database me-1"></i> Koneksi Supabase
            </button>
          </li>
          <li class="nav-item">
            <button
              class="nav-link rounded-3 fw-semibold small"
              :class="{ 'active': activeTab === 'sql' }"
              @click="activeTab = 'sql'"
            >
              <i class="bi bi-code-square me-1"></i> Skrip SQL Database
            </button>
          </li>
        </ul>

        <!-- TAB 1: IDENTITAS & PERIODE SEKOLAH -->
        <div v-if="activeTab === 'school'" class="card-custom bg-white border p-4 rounded-4 shadow-sm">
          <h5 class="fw-bold text-dark mb-1">Pengaturan Identitas Sekolah & Pemilihan</h5>
          <p class="text-secondary small mb-4">
            Data ini akan otomatis ditampilkan pada judul website, navbar, kartu suara, dan laporan pemilihan.
          </p>

          <form @submit.prevent="saveSchoolSettings">
            <div class="row g-4">
              <!-- School Name -->
              <div class="col-md-7">
                <div class="mb-3">
                  <label class="form-label small fw-semibold text-dark">Nama Sekolah <span class="text-danger">*</span></label>
                  <input
                    v-model="schoolForm.school_name"
                    type="text"
                    class="form-control py-2"
                    placeholder="Contoh: SMA Negeri 1 Teladan Jakarta"
                    required
                  />
                </div>

                <div class="row g-3 mb-3">
                  <div class="col-sm-6">
                    <label class="form-label small fw-semibold text-dark">Periode Pemilihan <span class="text-danger">*</span></label>
                    <input
                      v-model="schoolForm.election_period"
                      type="text"
                      class="form-control py-2"
                      placeholder="Contoh: 2026/2027"
                      required
                    />
                  </div>

                  <div class="col-sm-6">
                    <label class="form-label small fw-semibold text-dark">Status Pemilihan</label>
                    <select v-model="schoolForm.is_active" class="form-select py-2">
                      <option :value="true">Buka (Siswa Dapat Memilih)</option>
                      <option :value="false">Tutup (Pemilihan Berhenti)</option>
                    </select>
                  </div>
                </div>

                <div class="row g-3 mb-3">
                  <div class="col-sm-6">
                    <label class="form-label small fw-semibold text-dark">Tanggal Mulai</label>
                    <input
                      v-model="schoolForm.start_date"
                      type="date"
                      class="form-control py-2"
                    />
                  </div>

                  <div class="col-sm-6">
                    <label class="form-label small fw-semibold text-dark">Tanggal Selesai</label>
                    <input
                      v-model="schoolForm.end_date"
                      type="date"
                      class="form-control py-2"
                    />
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label small fw-semibold text-dark">Pengumuman untuk Pemilih</label>
                  <textarea
                    v-model="schoolForm.announcement"
                    rows="2"
                    class="form-control"
                    placeholder="Pesan motivasi atau tata tertib bagi siswa pemilih..."
                  ></textarea>
                </div>
              </div>

              <!-- Logo & Preview -->
              <div class="col-md-5">
                <div class="p-3 bg-light rounded-4 border text-center">
                  <label class="form-label small fw-semibold text-dark d-block text-start mb-2">Logo Sekolah</label>

                  <div class="d-flex justify-content-center mb-3">
                    <div class="rounded-circle overflow-hidden border shadow-sm bg-white p-1" style="width: 100px; height: 100px;">
                      <img
                        v-if="schoolForm.school_logo"
                        :src="schoolForm.school_logo"
                        alt="Logo Sekolah"
                        class="w-100 h-100 rounded-circle object-fit-cover"
                      />
                      <div v-else class="w-100 h-100 d-flex align-items-center justify-content-center bg-light text-muted">
                        <i class="bi bi-image fs-1"></i>
                      </div>
                    </div>
                  </div>

                  <div class="mb-3 text-start">
                    <label class="form-label small text-muted">URL Logo:</label>
                    <input
                      v-model="schoolForm.school_logo"
                      type="text"
                      class="form-control form-control-sm mb-2"
                      placeholder="https://... / logo image URL"
                    />

                    <label class="form-label small text-muted">Atau Unggah File Logo:</label>
                    <input
                      type="file"
                      class="form-control form-control-sm"
                      accept="image/*"
                      @change="handleLogoUpload"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div class="pt-4 border-top text-end">
              <button type="submit" class="btn btn-primary px-4 py-2 rounded-3 shadow-sm" :disabled="isSaving">
                <i class="bi bi-save me-1"></i>
                {{ isSaving ? 'Menyimpan...' : 'Simpan Pengaturan Sekolah' }}
              </button>
            </div>
          </form>
        </div>

        <!-- TAB 2: KEAMANAN AKUN ADMIN -->
        <div v-if="activeTab === 'admin'" class="card-custom bg-white border p-4 rounded-4 shadow-sm" style="max-width: 600px;">
          <h5 class="fw-bold text-dark mb-1">Ganti Kredensial Administrator</h5>
          <p class="text-secondary small mb-4">
            Ubah username atau password admin. Password dienkripsi dengan standar hash SHA-256 yang aman.
          </p>

          <form @submit.prevent="saveAdminCredentials">
            <div class="mb-3">
              <label class="form-label small fw-semibold text-dark">Username Admin <span class="text-danger">*</span></label>
              <div class="input-group">
                <span class="input-group-text bg-light"><i class="bi bi-person"></i></span>
                <input
                  v-model="adminForm.username"
                  type="text"
                  class="form-control py-2"
                  required
                />
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label small fw-semibold text-dark">Password Lama <span class="text-danger">*</span></label>
              <div class="input-group">
                <span class="input-group-text bg-light"><i class="bi bi-key"></i></span>
                <input
                  v-model="adminForm.currentPassword"
                  type="password"
                  class="form-control py-2"
                  placeholder="Masukkan password saat ini untuk konfirmasi"
                  required
                />
              </div>
            </div>

            <div class="row g-3 mb-4">
              <div class="col-sm-6">
                <label class="form-label small fw-semibold text-dark">Password Baru <span class="text-danger">*</span></label>
                <input
                  v-model="adminForm.newPassword"
                  type="password"
                  class="form-control py-2"
                  placeholder="Minimal 6 karakter"
                  required
                  minlength="6"
                />
              </div>

              <div class="col-sm-6">
                <label class="form-label small fw-semibold text-dark">Konfirmasi Password Baru <span class="text-danger">*</span></label>
                <input
                  v-model="adminForm.confirmPassword"
                  type="password"
                  class="form-control py-2"
                  placeholder="Ulangi password baru"
                  required
                />
              </div>
            </div>

            <button type="submit" class="btn btn-primary px-4 py-2 rounded-3 shadow-sm" :disabled="isSaving">
              <i class="bi bi-shield-check me-1"></i>
              {{ isSaving ? 'Memperbarui...' : 'Perbarui Kredensial Admin' }}
            </button>
          </form>
        </div>

        <!-- TAB 3: KONEKSI SUPABASE -->
        <div v-if="activeTab === 'supabase'" class="card-custom bg-white border p-4 rounded-4 shadow-sm">
          <div class="d-flex align-items-center justify-content-between mb-3">
            <div>
              <h5 class="fw-bold text-dark mb-1">Konfigurasi Database Supabase</h5>
              <p class="text-secondary small mb-0">
                Hubungkan aplikasi eOSIS dengan database Supabase PostgreSQL cloud Anda.
              </p>
            </div>
            <div>
              <span v-if="isSupabaseConnected" class="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill">
                <i class="bi bi-check-circle-fill me-1"></i> Terhubung ke Supabase
              </span>
              <span v-else class="badge bg-warning-subtle text-warning border border-warning-subtle px-3 py-2 rounded-pill">
                <i class="bi bi-hdd-fill me-1"></i> Mode Offline / Local Storage
              </span>
            </div>
          </div>

          <div class="alert alert-light border small text-secondary p-3 rounded-3 mb-4">
            <div class="fw-bold text-dark mb-1">
              <i class="bi bi-info-circle text-primary me-1"></i> Panduan Kunci Supabase:
            </div>
            Gunakan <strong>Project URL</strong> dan <strong>anon/public key</strong> dari menu <em>Project Settings &gt; API</em> di dashboard Supabase Anda. Sesuai prinsip keamanan modern, <u>jangan pernah</u> memasukkan Service Role Key di frontend.
          </div>

          <form @submit.prevent="saveSupabaseConfig">
            <div class="mb-3">
              <label class="form-label small fw-semibold text-dark">Supabase Project URL</label>
              <div class="input-group">
                <span class="input-group-text bg-light text-muted">URL</span>
                <input
                  v-model="supabaseForm.url"
                  type="url"
                  class="form-control py-2"
                  placeholder="https://xyzcompany.supabase.co"
                />
              </div>
            </div>

            <div class="mb-4">
              <label class="form-label small fw-semibold text-dark">Supabase Anon Key (Public Key)</label>
              <div class="input-group">
                <span class="input-group-text bg-light text-muted">KEY</span>
                <input
                  v-model="supabaseForm.key"
                  type="password"
                  class="form-control py-2"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                />
              </div>
            </div>

            <div class="d-flex flex-wrap gap-2">
              <button type="submit" class="btn btn-primary px-4 py-2 rounded-3 shadow-sm" :disabled="isSaving">
                <i class="bi bi-plug-fill me-1"></i>
                {{ isSaving ? 'Menghubungkan...' : 'Simpan & Hubungkan Supabase' }}
              </button>

              <button type="button" class="btn btn-outline-secondary px-3 py-2 rounded-3" @click="testConnection">
                <i class="bi bi-arrow-repeat me-1"></i> Uji Koneksi
              </button>

              <button type="button" class="btn btn-outline-danger px-3 py-2 rounded-3 ms-auto" @click="resetToLocal">
                <i class="bi bi-arrow-counterclockwise me-1"></i> Reset ke Penyimpanan Lokal
              </button>
            </div>
          </form>
        </div>

        <!-- TAB 4: SKRIP SQL DATABASE -->
        <div v-if="activeTab === 'sql'" class="card-custom bg-white border p-4 rounded-4 shadow-sm">
          <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-3">
            <div>
              <h5 class="fw-bold text-dark mb-1">Skrip SQL Inisialisasi Database Supabase</h5>
              <p class="text-secondary small mb-0">
                Jalankan skrip ini di <strong>SQL Editor</strong> dashboard Supabase Anda untuk membuat seluruh tabel, constraint, RLS, storage, dan fungsi RPC voting atomik.
              </p>
            </div>
            <button class="btn btn-outline-primary btn-sm rounded-3 d-flex align-items-center gap-1" @click="copySql">
              <i :class="copied ? 'bi bi-check-lg text-success' : 'bi bi-clipboard'"></i>
              <span>{{ copied ? 'Tersalin ke Clipboard!' : 'Salin Seluruh SQL' }}</span>
            </button>
          </div>

          <div class="position-relative">
            <pre class="bg-dark text-light p-3.5 rounded-4 small overflow-auto font-monospace border" style="max-height: 480px; font-size: 0.8rem; line-height: 1.5;"><code>{{ sqlScript }}</code></pre>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import AdminSidebar from '../../components/AdminSidebar.vue';
import { supabaseService, sha256 } from '../../services/supabase';
import type { SchoolSettings } from '../../types';

const sidebarOpen = ref(false);
const activeTab = ref<'school' | 'admin' | 'supabase' | 'sql'>('school');
const alertMessage = ref('');
const errorMessage = ref('');
const isSaving = ref(false);
const isSupabaseConnected = ref(false);
const copied = ref(false);

// Forms
const schoolForm = ref<SchoolSettings>({
  school_name: '',
  school_logo: '',
  election_period: '2026/2027',
  start_date: '',
  end_date: '',
  is_active: true,
  announcement: '',
});

const adminForm = ref({
  username: 'admin',
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const supabaseForm = ref({
  url: '',
  key: '',
});

// Full SQL Schema text for user reference
const sqlScript = ref(`-- ==============================================================================
-- DATABASE SCHEMA: eOSIS (Pemilihan OSIS) - Supabase PostgreSQL
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABEL KELAS
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    grade VARCHAR(10) NOT NULL,
    major VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABEL SISWA (PEMILIH)
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
CREATE INDEX IF NOT EXISTS idx_students_nisn_birth ON public.students(nisn, birth_date);

-- 3. TABEL CALON KANDIDAT
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

-- 4. TABEL KOTAK SUARA ANONIM (TIDAK MENYIMPAN ID SISWA)
CREATE TABLE IF NOT EXISTS public.votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABEL PENGATURAN
CREATE TABLE IF NOT EXISTS public.app_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_name VARCHAR(200) NOT NULL DEFAULT 'SMA Negeri 1 Teladan Jakarta',
    school_logo TEXT DEFAULT '',
    election_period VARCHAR(50) NOT NULL DEFAULT '2026/2027',
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE DEFAULT (CURRENT_DATE + INTERVAL '7 days'),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    announcement TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABEL ADMIN CREDENTIALS (HASHED PASSWORD)
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name VARCHAR(150) NOT NULL DEFAULT 'Administrator Utama',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. FUNCTION / RPC SUBMIT_VOTE (ATOMIC VALIDATION)
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
BEGIN
    SELECT is_active INTO v_is_election_active FROM public.app_settings LIMIT 1;
    IF v_is_election_active IS NOT NULL AND v_is_election_active = FALSE THEN
        RAISE EXCEPTION 'Pemilihan OSIS saat ini sedang ditutup.';
    END IF;

    SELECT has_voted INTO v_has_voted FROM public.students WHERE id = p_student_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Siswa pemilih tidak ditemukan.';
    END IF;

    IF v_has_voted = TRUE THEN
        RAISE EXCEPTION 'Anda sudah menggunakan hak suara sebelumnya.';
    END IF;

    UPDATE public.students SET has_voted = TRUE, voted_at = NOW() WHERE id = p_student_id;
    INSERT INTO public.votes (candidate_id, created_at) VALUES (p_candidate_id, NOW());

    RETURN jsonb_build_object('success', TRUE, 'message', 'Suara Anda berhasil dicatat, terima kasih telah berpartisipasi.');
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('success', FALSE, 'message', SQLERRM);
END;
$$;

-- 8. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read classes" ON public.classes;
DROP POLICY IF EXISTS "Admin write classes" ON public.classes;
CREATE POLICY "Public read classes" ON public.classes FOR SELECT USING (true);
CREATE POLICY "Admin write classes" ON public.classes FOR ALL USING (true);

DROP POLICY IF EXISTS "Public read candidates" ON public.candidates;
DROP POLICY IF EXISTS "Admin write candidates" ON public.candidates;
CREATE POLICY "Public read candidates" ON public.candidates FOR SELECT USING (true);
CREATE POLICY "Admin write candidates" ON public.candidates FOR ALL USING (true);

DROP POLICY IF EXISTS "Public read settings" ON public.app_settings;
DROP POLICY IF EXISTS "Admin write settings" ON public.app_settings;
CREATE POLICY "Public read settings" ON public.app_settings FOR SELECT USING (true);
CREATE POLICY "Admin write settings" ON public.app_settings FOR ALL USING (true);

DROP POLICY IF EXISTS "Students read own" ON public.students;
DROP POLICY IF EXISTS "Admin write students" ON public.students;
CREATE POLICY "Students read own" ON public.students FOR SELECT USING (true);
CREATE POLICY "Admin write students" ON public.students FOR ALL USING (true);

DROP POLICY IF EXISTS "Public read votes" ON public.votes;
DROP POLICY IF EXISTS "Insert vote via RPC" ON public.votes;
CREATE POLICY "Public read votes" ON public.votes FOR SELECT USING (true);
CREATE POLICY "Insert vote via RPC" ON public.votes FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin users read and write" ON public.admin_users;
CREATE POLICY "Admin users read and write" ON public.admin_users FOR ALL USING (true);

-- 9. STORAGE BUCKET
INSERT INTO storage.buckets (id, name, public) VALUES ('eosis-assets', 'eosis-assets', true) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Access eosis-assets" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload eosis-assets" ON storage.objects;
CREATE POLICY "Public Access eosis-assets" ON storage.objects FOR SELECT USING (bucket_id = 'eosis-assets');
CREATE POLICY "Public Upload eosis-assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'eosis-assets');
`);

const loadSettings = async () => {
  const current = await supabaseService.getSettings();
  schoolForm.value = { ...current };

  const adminProfile = supabaseService.getAdminProfile();
  adminForm.value.username = adminProfile.username || 'admin';

  const cfg = supabaseService.getConfig();
  supabaseForm.value = { url: cfg.url, key: cfg.key };
  isSupabaseConnected.value = supabaseService.isConnected;
};

const handleLogoUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      schoolForm.value.school_logo = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

const saveSchoolSettings = async () => {
  isSaving.value = true;
  alertMessage.value = '';
  errorMessage.value = '';

  try {
    await supabaseService.updateSettings(schoolForm.value);
    alertMessage.value = 'Pengaturan sekolah dan periode pemilihan berhasil disimpan!';
  } catch (err: any) {
    errorMessage.value = err.message || 'Gagal menyimpan pengaturan sekolah.';
  } finally {
    isSaving.value = false;
  }
};

const saveAdminCredentials = async () => {
  alertMessage.value = '';
  errorMessage.value = '';

  if (adminForm.value.newPassword !== adminForm.value.confirmPassword) {
    errorMessage.value = 'Konfirmasi password baru tidak cocok!';
    return;
  }

  isSaving.value = true;
  try {
    // Verify old password first
    const isOldValid = await supabaseService.verifyAdmin(adminForm.value.username, adminForm.value.currentPassword);
    if (!isOldValid) {
      errorMessage.value = 'Password lama tidak sesuai!';
      isSaving.value = false;
      return;
    }

    await supabaseService.updateAdminPassword(adminForm.value.username, adminForm.value.newPassword);
    alertMessage.value = 'Username dan password admin berhasil diperbarui!';
    adminForm.value.currentPassword = '';
    adminForm.value.newPassword = '';
    adminForm.value.confirmPassword = '';
  } catch (err: any) {
    errorMessage.value = err.message || 'Gagal mengubah password admin.';
  } finally {
    isSaving.value = false;
  }
};

const saveSupabaseConfig = async () => {
  isSaving.value = true;
  alertMessage.value = '';
  errorMessage.value = '';

  try {
    const initialized = await supabaseService.setConfig(supabaseForm.value.url, supabaseForm.value.key);
    if (initialized) {
      const connected = await supabaseService.testConnection();
      isSupabaseConnected.value = connected;
      if (connected) {
        alertMessage.value = 'Koneksi ke Supabase berhasil diaktifkan!';
      } else {
        alertMessage.value = 'Konfigurasi Supabase disimpan. Pastikan Anda telah menjalankan skrip SQL di Tab Skrip SQL.';
      }
    } else {
      isSupabaseConnected.value = false;
      alertMessage.value = 'Mode penyimpanan lokal diaktifkan.';
    }
  } catch (err: any) {
    errorMessage.value = err.message || 'Gagal menyimpan konfigurasi Supabase.';
  } finally {
    isSaving.value = false;
  }
};

const testConnection = async () => {
  alertMessage.value = '';
  errorMessage.value = '';
  const success = await supabaseService.testConnection();
  isSupabaseConnected.value = success;
  if (success) {
    alertMessage.value = 'Koneksi ke Supabase aktif dan berhasil merespon!';
  } else {
    errorMessage.value = 'Koneksi ke Supabase gagal atau tabel belum dibuat di database. Jalankan skrip di tab "Skrip SQL Database".';
  }
};

const resetToLocal = async () => {
  if (confirm('Apakah Anda yakin ingin memutuskan Supabase dan kembali ke penyimpanan lokal?')) {
    await supabaseService.setConfig('', '');
    supabaseForm.value = { url: '', key: '' };
    isSupabaseConnected.value = false;
    alertMessage.value = 'Aplikasi beralih ke penyimpanan lokal (Local Storage).';
  }
};

const copySql = async () => {
  try {
    await navigator.clipboard.writeText(sqlScript.value);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2500);
  } catch (e) {
    alert('Silakan salin teks SQL secara manual.');
  }
};

onMounted(() => {
  loadSettings();
});
</script>
