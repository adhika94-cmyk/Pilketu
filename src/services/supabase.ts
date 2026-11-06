import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { SchoolSettings, ClassItem, Student, Candidate, DashboardStats } from '../types';

// Storage keys
const STORAGE_KEYS = {
  SUPABASE_URL: 'eosis_supabase_url',
  SUPABASE_ANON_KEY: 'eosis_supabase_anon_key',
  LOCAL_CLASSES: 'eosis_local_classes',
  LOCAL_STUDENTS: 'eosis_local_students',
  LOCAL_CANDIDATES: 'eosis_local_candidates',
  LOCAL_VOTES: 'eosis_local_votes',
  LOCAL_SETTINGS: 'eosis_local_settings',
  LOCAL_ADMIN: 'eosis_local_admin',
};

// SHA-256 hash helper for secure password hashing
export async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Initial mock candidates
const INITIAL_CANDIDATES: Candidate[] = [
  {
    id: 'c-1',
    order_number: 1,
    leader_name: 'Muhammad Farhan',
    vice_leader_name: 'Aisyah Putri Ramadhani',
    slogan: 'Bersinergi, Berprestasi, dan Berkarakter untuk OSIS Berkemajuan',
    vision: 'Mewujudkan OSIS sebagai wadah aspirasi siswa yang inklusif, inovatif, religius, dan berdaya saing global.',
    mission: [
      'Meningkatkan kegiatan kepemimpinan dan pembentukan karakter berasaskan nilai Pancasila.',
      'Membuat platform digital kotak aspirasi siswa yang transparan dan responsif.',
      'Mengembangkan minat dan bakat siswa di bidang akademik, seni budaya, serta teknologi.'
    ],
    photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    created_at: new Date().toISOString()
  },
  {
    id: 'c-2',
    order_number: 2,
    leader_name: 'Bima Satria Wicaksana',
    vice_leader_name: 'Nathania Aurelia',
    slogan: 'Kreatif, Kolaboratif, Solutif: Aksi Nyata Bukan Sekadar Wacana',
    vision: 'Membangun ekosistem sekolah yang adaptif, ramah lingkungan, dan mendukung perkembangan potensi setiap siswa.',
    mission: [
      'Menyelenggarakan festival seni dan pekan olahraga antar kelas (Classmeeting) yang spektakuler.',
      'Mengoptimalkan program green school dan digitalisasi mading sekolah.',
      'Mempererat kolaborasi lintas ekstrakurikuler dalam program pengabdian masyarakat.'
    ],
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    created_at: new Date().toISOString()
  },
  {
    id: 'c-3',
    order_number: 3,
    leader_name: 'Dimas Bagus Pratama',
    vice_leader_name: 'Clarissa Maharani',
    slogan: 'Inspirasi Tiada Henti, Mengabdi Sepenuh Hati',
    vision: 'Menjadikan OSIS yang berintegritas tinggi, menjunjung kekeluargaan, serta aktif berkontribusi bagi almamater.',
    mission: [
      'Mengadakan program mentoring akademik siswa berprestasi untuk teman sebaya.',
      'Memperluas jejaring persahabatan antar sekolah melalui kompetisi eksternal.',
      'Mendorong literasi digital dan kewirausahaan muda bagi siswa.'
    ],
    photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    created_at: new Date().toISOString()
  }
];

// Initial mock classes
const INITIAL_CLASSES: ClassItem[] = [
  { id: 'cls-1', name: 'X MIPA 1', grade: 'X', major: 'MIPA' },
  { id: 'cls-2', name: 'X MIPA 2', grade: 'X', major: 'MIPA' },
  { id: 'cls-3', name: 'XI MIPA 1', grade: 'XI', major: 'MIPA' },
  { id: 'cls-4', name: 'XI IPS 1', grade: 'XI', major: 'IPS' },
  { id: 'cls-5', name: 'XII MIPA 1', grade: 'XII', major: 'MIPA' },
  { id: 'cls-6', name: 'XII IPS 1', grade: 'XII', major: 'IPS' },
  { id: 'cls-guru', name: 'Dewan Guru', grade: 'Guru', major: 'Tenaga Pendidik' },
  { id: 'cls-staff', name: 'Staff Tata Usaha', grade: 'Staff', major: 'Tenaga Kependidikan' },
];

// Initial mock students & teachers
const INITIAL_STUDENTS: Student[] = [
  { id: 'std-1', nisn: '0071234001', name: 'Ahmad Raihan', birth_date: '2008-05-14', gender: 'L', class_id: 'cls-1', class_name: 'X MIPA 1', voter_type: 'SISWA', has_voted: false },
  { id: 'std-2', nisn: '0071234002', name: 'Bella Anindita', birth_date: '2008-08-22', gender: 'P', class_id: 'cls-1', class_name: 'X MIPA 1', voter_type: 'SISWA', has_voted: true, voted_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 'std-3', nisn: '0071234003', name: 'Citra Dewi Lestari', birth_date: '2007-02-10', gender: 'P', class_id: 'cls-3', class_name: 'XI MIPA 1', voter_type: 'SISWA', has_voted: false },
  { id: 'std-4', nisn: '0071234004', name: 'Davin Kurniawan', birth_date: '2007-11-30', gender: 'L', class_id: 'cls-4', class_name: 'XI IPS 1', voter_type: 'SISWA', has_voted: true, voted_at: new Date(Date.now() - 7200000).toISOString() },
  { id: 'std-5', nisn: '0071234005', name: 'Erina Zahrani', birth_date: '2006-03-18', gender: 'P', class_id: 'cls-5', class_name: 'XII MIPA 1', voter_type: 'SISWA', has_voted: false },
  { id: 'std-6', nisn: '0071234006', name: 'Fajar Nugraha', birth_date: '2006-09-05', gender: 'L', class_id: 'cls-6', class_name: 'XII IPS 1', voter_type: 'SISWA', has_voted: false },
  { id: 'std-7', nisn: '0071234007', name: 'Gita Saraswati', birth_date: '2008-01-25', gender: 'P', class_id: 'cls-2', class_name: 'X MIPA 2', voter_type: 'SISWA', has_voted: true, voted_at: new Date(Date.now() - 1800000).toISOString() },
  { id: 'std-8', nisn: '0071234008', name: 'Hafiz Pratama', birth_date: '2008-07-19', gender: 'L', class_id: 'cls-2', class_name: 'X MIPA 2', voter_type: 'SISWA', has_voted: false },
  { id: 'std-9', nisn: '0071234009', name: 'Indah Permata', birth_date: '2007-04-12', gender: 'P', class_id: 'cls-3', class_name: 'XI MIPA 1', voter_type: 'SISWA', has_voted: false },
  { id: 'std-10', nisn: '0071234010', name: 'Joko Prabowo', birth_date: '2006-12-01', gender: 'L', class_id: 'cls-5', class_name: 'XII MIPA 1', voter_type: 'SISWA', has_voted: true, voted_at: new Date(Date.now() - 900000).toISOString() },
  // Guru & Staff Pemilih
  { id: 'tch-1', nisn: '198503152010011002', name: 'Drs. H. Bambang Suryono, M.Pd', birth_date: '1985-03-15', gender: 'L', class_id: 'cls-guru', class_name: 'Dewan Guru', voter_type: 'GURU', has_voted: false },
  { id: 'tch-2', nisn: '199008242015022008', name: 'Siti Rahmawati, S.Pd', birth_date: '1990-08-24', gender: 'P', class_id: 'cls-guru', class_name: 'Dewan Guru', voter_type: 'GURU', has_voted: true, voted_at: new Date(Date.now() - 5400000).toISOString() },
  { id: 'stf-1', nisn: '199207212019032014', name: 'Arief Budiman, S.Kom', birth_date: '1992-07-21', gender: 'L', class_id: 'cls-staff', class_name: 'Staff Tata Usaha', voter_type: 'STAFF', has_voted: false },
];

const INITIAL_SETTINGS: SchoolSettings = {
  school_name: 'SMA Negeri 1 Teladan Jakarta',
  school_logo: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=200&q=80',
  election_period: '2026/2027',
  start_date: new Date().toISOString().split('T')[0],
  end_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
  is_active: true,
  announcement: 'Gunakan hak suara Anda secara jujur, bebas, dan bertanggung jawab demi kemajuan OSIS kita!'
};

// Initial anonymous votes corresponding to the 4 students who voted
const INITIAL_VOTES: { id: string; candidate_id: string; created_at: string }[] = [
  { id: 'v-1', candidate_id: 'c-1', created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: 'v-2', candidate_id: 'c-2', created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 'v-3', candidate_id: 'c-1', created_at: new Date(Date.now() - 1800000).toISOString() },
  { id: 'v-4', candidate_id: 'c-3', created_at: new Date(Date.now() - 900000).toISOString() },
];

class SupabaseService {
  private client: SupabaseClient | null = null;
  public isConnected: boolean = false;
  private isConfigured: boolean = false;

  constructor() {
    this.initClient();
    this.ensureLocalStore();
  }

  // Get active Supabase configuration (from env or localStorage)
  public getConfig(): { url: string; key: string } {
    const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
    const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
    const storedUrl = localStorage.getItem(STORAGE_KEYS.SUPABASE_URL) || '';
    const storedKey = localStorage.getItem(STORAGE_KEYS.SUPABASE_ANON_KEY) || '';

    return {
      url: storedUrl || envUrl,
      key: storedKey || envKey,
    };
  }

  // Save new Supabase config
  public async setConfig(url: string, key: string): Promise<boolean> {
    url = url.trim();
    key = key.trim();

    if (url && key) {
      localStorage.setItem(STORAGE_KEYS.SUPABASE_URL, url);
      localStorage.setItem(STORAGE_KEYS.SUPABASE_ANON_KEY, key);
      return this.initClient();
    } else {
      localStorage.removeItem(STORAGE_KEYS.SUPABASE_URL);
      localStorage.removeItem(STORAGE_KEYS.SUPABASE_ANON_KEY);
      this.client = null;
      this.isConnected = false;
      this.isConfigured = false;
      return false;
    }
  }

  public initClient(): boolean {
    const { url, key } = this.getConfig();
    if (url && key && url.startsWith('http')) {
      try {
        this.client = createClient(url, key);
        this.isConfigured = true;
        // Test lightweight ping asynchronously
        this.testConnection();
        return true;
      } catch (err) {
        console.warn('Failed to initialize Supabase client:', err);
        this.client = null;
        this.isConnected = false;
        return false;
      }
    }
    this.client = null;
    this.isConnected = false;
    this.isConfigured = false;
    return false;
  }

  public async testConnection(): Promise<boolean> {
    if (!this.client) {
      this.isConnected = false;
      return false;
    }
    try {
      const { data, error } = await this.client.from('app_settings').select('school_name').limit(1);
      if (error) {
        // May fail if table not created yet
        console.warn('Supabase test query warning:', error.message);
        this.isConnected = false;
        return false;
      }
      this.isConnected = true;
      return true;
    } catch {
      this.isConnected = false;
      return false;
    }
  }

  // Initialize Local Mock Store if empty or missing teacher categories
  private ensureLocalStore() {
    if (!localStorage.getItem(STORAGE_KEYS.LOCAL_CLASSES)) {
      localStorage.setItem(STORAGE_KEYS.LOCAL_CLASSES, JSON.stringify(INITIAL_CLASSES));
    } else {
      // Ensure cls-guru and cls-staff exist in stored classes
      try {
        const storedClasses: ClassItem[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOCAL_CLASSES) || '[]');
        let updated = false;
        if (!storedClasses.some(c => c.id === 'cls-guru')) {
          storedClasses.push({ id: 'cls-guru', name: 'Dewan Guru', grade: 'Guru', major: 'Tenaga Pendidik' });
          updated = true;
        }
        if (!storedClasses.some(c => c.id === 'cls-staff')) {
          storedClasses.push({ id: 'cls-staff', name: 'Staff Tata Usaha', grade: 'Staff', major: 'Tenaga Kependidikan' });
          updated = true;
        }
        if (updated) {
          localStorage.setItem(STORAGE_KEYS.LOCAL_CLASSES, JSON.stringify(storedClasses));
        }
      } catch (e) {}
    }

    if (!localStorage.getItem(STORAGE_KEYS.LOCAL_CANDIDATES)) {
      localStorage.setItem(STORAGE_KEYS.LOCAL_CANDIDATES, JSON.stringify(INITIAL_CANDIDATES));
    }

    if (!localStorage.getItem(STORAGE_KEYS.LOCAL_STUDENTS)) {
      localStorage.setItem(STORAGE_KEYS.LOCAL_STUDENTS, JSON.stringify(INITIAL_STUDENTS));
    } else {
      // Ensure demo teachers and staff exist in stored students
      try {
        const storedVoters: Student[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOCAL_STUDENTS) || '[]');
        let updated = false;
        if (!storedVoters.some(s => s.id === 'tch-1')) {
          storedVoters.push(
            { id: 'tch-1', nisn: '198503152010011002', name: 'Drs. H. Bambang Suryono, M.Pd', birth_date: '1985-03-15', gender: 'L', class_id: 'cls-guru', class_name: 'Dewan Guru', voter_type: 'GURU', has_voted: false },
            { id: 'tch-2', nisn: '199008242015022008', name: 'Siti Rahmawati, S.Pd', birth_date: '1990-08-24', gender: 'P', class_id: 'cls-guru', class_name: 'Dewan Guru', voter_type: 'GURU', has_voted: true, voted_at: new Date(Date.now() - 5400000).toISOString() },
            { id: 'stf-1', nisn: '199207212019032014', name: 'Arief Budiman, S.Kom', birth_date: '1992-07-21', gender: 'L', class_id: 'cls-staff', class_name: 'Staff Tata Usaha', voter_type: 'STAFF', has_voted: false }
          );
          updated = true;
        }
        if (updated) {
          localStorage.setItem(STORAGE_KEYS.LOCAL_STUDENTS, JSON.stringify(storedVoters));
        }
      } catch (e) {}
    }

    if (!localStorage.getItem(STORAGE_KEYS.LOCAL_SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.LOCAL_SETTINGS, JSON.stringify(INITIAL_SETTINGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.LOCAL_VOTES)) {
      localStorage.setItem(STORAGE_KEYS.LOCAL_VOTES, JSON.stringify(INITIAL_VOTES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.LOCAL_ADMIN)) {
      // default: username: admin, password: admin123 (sha256 hash)
      localStorage.setItem(
        STORAGE_KEYS.LOCAL_ADMIN,
        JSON.stringify({
          username: 'admin',
          password_hash: '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
          name: 'Administrator Utama OSIS',
        })
      );
    }
  }

  // Reset to initial demo data
  public resetToDefault() {
    localStorage.setItem(STORAGE_KEYS.LOCAL_CLASSES, JSON.stringify(INITIAL_CLASSES));
    localStorage.setItem(STORAGE_KEYS.LOCAL_CANDIDATES, JSON.stringify(INITIAL_CANDIDATES));
    localStorage.setItem(STORAGE_KEYS.LOCAL_STUDENTS, JSON.stringify(INITIAL_STUDENTS));
    localStorage.setItem(STORAGE_KEYS.LOCAL_SETTINGS, JSON.stringify(INITIAL_SETTINGS));
    localStorage.setItem(STORAGE_KEYS.LOCAL_VOTES, JSON.stringify(INITIAL_VOTES));
  }

  // ==========================================
  // SETTINGS
  // ==========================================
  public async getSettings(): Promise<SchoolSettings> {
    if (this.client) {
      try {
        const { data, error } = await this.client.from('app_settings').select('*').limit(1).single();
        if (!error && data) {
          return data as SchoolSettings;
        }
      } catch (e) {
        console.warn('Supabase getSettings fallback to local:', e);
      }
    }
    const raw = localStorage.getItem(STORAGE_KEYS.LOCAL_SETTINGS);
    return raw ? JSON.parse(raw) : INITIAL_SETTINGS;
  }

  public async updateSettings(settings: Partial<SchoolSettings>): Promise<SchoolSettings> {
    if (this.client) {
      try {
        const { data: existing } = await this.client.from('app_settings').select('id').limit(1).single();
        if (existing?.id) {
          const { data, error } = await this.client
            .from('app_settings')
            .update({ ...settings, updated_at: new Date().toISOString() })
            .eq('id', existing.id)
            .select()
            .single();
          if (!error && data) return data as SchoolSettings;
        }
      } catch (e) {
        console.warn('Supabase updateSettings fallback to local:', e);
      }
    }

    const current = await this.getSettings();
    const updated = { ...current, ...settings, updated_at: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.LOCAL_SETTINGS, JSON.stringify(updated));
    return updated;
  }

  // ==========================================
  // CLASSES CRUD
  // ==========================================
  public async getClasses(): Promise<ClassItem[]> {
    if (this.client) {
      try {
        const { data, error } = await this.client.from('classes').select('*').order('name', { ascending: true });
        if (!error && data) return data as ClassItem[];
      } catch (e) {
        console.warn('Supabase getClasses fallback:', e);
      }
    }
    const raw = localStorage.getItem(STORAGE_KEYS.LOCAL_CLASSES);
    return raw ? JSON.parse(raw) : [];
  }

  public async addClass(classItem: Omit<ClassItem, 'id'>): Promise<ClassItem> {
    const newItem: ClassItem = {
      ...classItem,
      id: 'cls-' + Date.now(),
      created_at: new Date().toISOString(),
    };

    if (this.client) {
      try {
        const { data, error } = await this.client.from('classes').insert(classItem).select().single();
        if (!error && data) return data as ClassItem;
      } catch (e) {
        console.warn('Supabase addClass fallback:', e);
      }
    }

    const list = await this.getClasses();
    list.push(newItem);
    localStorage.setItem(STORAGE_KEYS.LOCAL_CLASSES, JSON.stringify(list));
    return newItem;
  }

  public async updateClass(id: string, updates: Partial<ClassItem>): Promise<ClassItem> {
    if (this.client) {
      try {
        const { data, error } = await this.client.from('classes').update(updates).eq('id', id).select().single();
        if (!error && data) return data as ClassItem;
      } catch (e) {
        console.warn('Supabase updateClass fallback:', e);
      }
    }

    const list = await this.getClasses();
    const index = list.findIndex(c => c.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updates };
      localStorage.setItem(STORAGE_KEYS.LOCAL_CLASSES, JSON.stringify(list));
      return list[index];
    }
    throw new Error('Kelas tidak ditemukan');
  }

  public async deleteClass(id: string): Promise<boolean> {
    if (this.client) {
      try {
        const { error } = await this.client.from('classes').delete().eq('id', id);
        if (!error) return true;
      } catch (e) {
        console.warn('Supabase deleteClass fallback:', e);
      }
    }

    const list = await this.getClasses();
    const filtered = list.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.LOCAL_CLASSES, JSON.stringify(filtered));
    return true;
  }

  // ==========================================
  // CANDIDATES CRUD
  // ==========================================
  public async getCandidates(): Promise<Candidate[]> {
    if (this.client) {
      try {
        const { data, error } = await this.client.from('candidates').select('*').order('order_number', { ascending: true });
        if (!error && data) {
          // Calculate vote counts
          const votes = await this.getVotes();
          const totalVotes = votes.length;
          return (data as Candidate[]).map(c => {
            const count = votes.filter(v => v.candidate_id === c.id).length;
            const percentage = totalVotes > 0 ? Number(((count / totalVotes) * 100).toFixed(1)) : 0;
            return { ...c, vote_count: count, percentage };
          });
        }
      } catch (e) {
        console.warn('Supabase getCandidates fallback:', e);
      }
    }

    const raw = localStorage.getItem(STORAGE_KEYS.LOCAL_CANDIDATES);
    const candidates: Candidate[] = raw ? JSON.parse(raw) : [];
    const votes = await this.getVotes();
    const totalVotes = votes.length;

    return candidates
      .sort((a, b) => a.order_number - b.order_number)
      .map(c => {
        const count = votes.filter(v => v.candidate_id === c.id).length;
        const percentage = totalVotes > 0 ? Number(((count / totalVotes) * 100).toFixed(1)) : 0;
        return { ...c, vote_count: count, percentage };
      });
  }

  public async addCandidate(candidate: Omit<Candidate, 'id'>): Promise<Candidate> {
    const newItem: Candidate = {
      ...candidate,
      id: 'c-' + Date.now(),
      created_at: new Date().toISOString(),
    };

    if (this.client) {
      try {
        const { data, error } = await this.client.from('candidates').insert(candidate).select().single();
        if (!error && data) return data as Candidate;
      } catch (e) {
        console.warn('Supabase addCandidate fallback:', e);
      }
    }

    const list = await this.getCandidates();
    list.push(newItem);
    localStorage.setItem(STORAGE_KEYS.LOCAL_CANDIDATES, JSON.stringify(list));
    return newItem;
  }

  public async updateCandidate(id: string, updates: Partial<Candidate>): Promise<Candidate> {
    if (this.client) {
      try {
        const { data, error } = await this.client.from('candidates').update(updates).eq('id', id).select().single();
        if (!error && data) return data as Candidate;
      } catch (e) {
        console.warn('Supabase updateCandidate fallback:', e);
      }
    }

    const list = await this.getCandidates();
    const index = list.findIndex(c => c.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updates };
      localStorage.setItem(STORAGE_KEYS.LOCAL_CANDIDATES, JSON.stringify(list));
      return list[index];
    }
    throw new Error('Kandidat tidak ditemukan');
  }

  public async deleteCandidate(id: string): Promise<boolean> {
    if (this.client) {
      try {
        const { error } = await this.client.from('candidates').delete().eq('id', id);
        if (!error) return true;
      } catch (e) {
        console.warn('Supabase deleteCandidate fallback:', e);
      }
    }

    const list = await this.getCandidates();
    const filtered = list.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.LOCAL_CANDIDATES, JSON.stringify(filtered));
    return true;
  }

  // ==========================================
  // STUDENTS CRUD & LOGIN
  // ==========================================
  public async getStudents(): Promise<Student[]> {
    if (this.client) {
      try {
        const { data, error } = await this.client
          .from('students')
          .select('*, classes(name)')
          .order('name', { ascending: true });
        if (!error && data) {
          return data.map((item: any) => ({
            ...item,
            class_name: item.classes?.name || 'Tanpa Kelas',
          })) as Student[];
        }
      } catch (e) {
        console.warn('Supabase getStudents fallback:', e);
      }
    }

    const raw = localStorage.getItem(STORAGE_KEYS.LOCAL_STUDENTS);
    const students: Student[] = raw ? JSON.parse(raw) : [];
    const classes = await this.getClasses();
    const classMap = new Map(classes.map(c => [c.id, c.name]));

    return students.map(s => ({
      ...s,
      class_name: classMap.get(s.class_id) || s.class_name || 'Tanpa Kelas',
    }));
  }

  public async findStudentForLogin(nisn: string, birthDate: string): Promise<Student | null> {
    nisn = nisn.trim();
    birthDate = birthDate.trim();

    if (this.client) {
      try {
        const { data, error } = await this.client
          .from('students')
          .select('*, classes(name)')
          .eq('nisn', nisn)
          .eq('birth_date', birthDate)
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          return {
            ...data,
            class_name: data.classes?.name || 'Tanpa Kelas',
          } as Student;
        }
      } catch (e) {
        console.warn('Supabase findStudentForLogin fallback:', e);
      }
    }

    const students = await this.getStudents();
    const found = students.find(s => s.nisn === nisn && s.birth_date === birthDate);
    return found || null;
  }

  public async addStudent(student: Omit<Student, 'id' | 'has_voted' | 'voted_at'>): Promise<Student> {
    const newItem: Student = {
      ...student,
      id: 'std-' + Date.now(),
      has_voted: false,
      voted_at: null,
      created_at: new Date().toISOString(),
    };

    if (this.client) {
      try {
        const { data, error } = await this.client.from('students').insert({
          nisn: student.nisn,
          name: student.name,
          birth_date: student.birth_date,
          gender: student.gender,
          class_id: student.class_id,
          voter_type: student.voter_type || 'SISWA',
          has_voted: false,
        }).select().single();
        if (!error && data) return data as Student;
      } catch (e) {
        console.warn('Supabase addStudent fallback:', e);
      }
    }

    const list = await this.getStudents();
    // Validate unique NISN
    if (list.some(s => s.nisn === student.nisn)) {
      throw new Error(`NISN ${student.nisn} sudah terdaftar.`);
    }

    list.push(newItem);
    localStorage.setItem(STORAGE_KEYS.LOCAL_STUDENTS, JSON.stringify(list));
    return newItem;
  }

  public async updateStudent(id: string, updates: Partial<Student>): Promise<Student> {
    if (this.client) {
      try {
        const { data, error } = await this.client.from('students').update(updates).eq('id', id).select().single();
        if (!error && data) return data as Student;
      } catch (e) {
        console.warn('Supabase updateStudent fallback:', e);
      }
    }

    const list = await this.getStudents();
    const index = list.findIndex(s => s.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updates };
      localStorage.setItem(STORAGE_KEYS.LOCAL_STUDENTS, JSON.stringify(list));
      return list[index];
    }
    throw new Error('Siswa tidak ditemukan');
  }

  public async deleteStudent(id: string): Promise<boolean> {
    if (this.client) {
      try {
        const { error } = await this.client.from('students').delete().eq('id', id);
        if (!error) return true;
      } catch (e) {
        console.warn('Supabase deleteStudent fallback:', e);
      }
    }

    const list = await this.getStudents();
    const filtered = list.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.LOCAL_STUDENTS, JSON.stringify(filtered));
    return true;
  }

  // ==========================================
  // VOTING ENGINE (RPC SUBMIT_VOTE)
  // Backend & Database validation of 1-vote constraint
  // ==========================================
  public async submitVote(studentId: string, candidateId: string): Promise<{ success: boolean; message: string }> {
    // 1. If Supabase is connected, call RPC function
    if (this.client) {
      try {
        const { data, error } = await this.client.rpc('submit_vote', {
          p_student_id: studentId,
          p_candidate_id: candidateId,
        });

        if (!error && data) {
          if (data.success) {
            return { success: true, message: data.message || 'Suara Anda berhasil dicatat, terima kasih telah berpartisipasi.' };
          } else {
            return { success: false, message: data.message || 'Gagal memberikan suara.' };
          }
        }
        if (error) {
          return { success: false, message: error.message };
        }
      } catch (err: any) {
        console.warn('Supabase RPC call failed, testing fallback:', err);
      }
    }

    // 2. Fallback / Local Store Atomic Validation (Same database logic)
    const settings = await this.getSettings();
    if (!settings.is_active) {
      return { success: false, message: 'Pemilihan OSIS saat ini sedang ditutup atau belum dimulai.' };
    }

    const students = await this.getStudents();
    const studentIndex = students.findIndex(s => s.id === studentId);
    if (studentIndex === -1) {
      return { success: false, message: 'Data siswa pemilih tidak ditemukan.' };
    }

    // Enforce 1-vote constraint
    if (students[studentIndex].has_voted) {
      return {
        success: false,
        message: 'Anda sudah menggunakan hak suara Anda sebelumnya. Setiap siswa hanya diperbolehkan memilih 1 kali.',
      };
    }

    // Verify candidate
    const candidates = await this.getCandidates();
    const candidateExists = candidates.some(c => c.id === candidateId);
    if (!candidateExists) {
      return { success: false, message: 'Kandidat yang Anda pilih tidak valid.' };
    }

    // Update student has_voted = true
    students[studentIndex].has_voted = true;
    students[studentIndex].voted_at = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.LOCAL_STUDENTS, JSON.stringify(students));

    // Record anonymous vote into votes table (NO student_id stored!)
    const votes = await this.getVotes();
    votes.push({
      id: 'v-' + Date.now(),
      candidate_id: candidateId,
      created_at: new Date().toISOString(),
    });
    localStorage.setItem(STORAGE_KEYS.LOCAL_VOTES, JSON.stringify(votes));

    return {
      success: true,
      message: 'Suara Anda berhasil dicatat, terima kasih telah berpartisipasi.',
    };
  }

  public async getVotes(): Promise<{ id: string; candidate_id: string; created_at: string }[]> {
    if (this.client) {
      try {
        const { data, error } = await this.client.from('votes').select('*');
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase getVotes fallback:', e);
      }
    }
    const raw = localStorage.getItem(STORAGE_KEYS.LOCAL_VOTES);
    return raw ? JSON.parse(raw) : [];
  }

  // ==========================================
  // DASHBOARD STATS
  // ==========================================
  public async getDashboardStats(): Promise<DashboardStats> {
    const students = await this.getStudents();
    const classes = await this.getClasses();
    const candidates = await this.getCandidates();

    const totalStudents = students.filter(s => (s.voter_type || 'SISWA') === 'SISWA').length;
    const totalTeachers = students.filter(s => s.voter_type === 'GURU' || s.voter_type === 'STAFF').length;
    const totalVoters = students.length;
    const votedStudents = students.filter(s => s.has_voted).length;
    const unvotedStudents = totalVoters - votedStudents;
    const participationRate = totalVoters > 0 ? Number(((votedStudents / totalVoters) * 100).toFixed(1)) : 0;

    return {
      totalStudents,
      totalTeachers,
      totalClasses: classes.length,
      totalCandidates: candidates.length,
      votedStudents,
      unvotedStudents,
      participationRate,
    };
  }

  // ==========================================
  // ADMIN AUTH
  // ==========================================
  public async verifyAdmin(username: string, passwordPlain: string): Promise<boolean> {
    const hash = await sha256(passwordPlain);

    if (this.client) {
      try {
        const { data, error } = await this.client
          .from('admin_users')
          .select('id, username')
          .eq('username', username)
          .eq('password_hash', hash)
          .limit(1)
          .maybeSingle();

        if (!error && data) return true;
      } catch (e) {
        console.warn('Supabase verifyAdmin fallback:', e);
      }
    }

    const raw = localStorage.getItem(STORAGE_KEYS.LOCAL_ADMIN);
    if (!raw) return false;
    const admin = JSON.parse(raw);
    return admin.username === username && admin.password_hash === hash;
  }

  public async updateAdminPassword(username: string, newPasswordPlain: string): Promise<boolean> {
    const newHash = await sha256(newPasswordPlain);

    if (this.client) {
      try {
        const { error } = await this.client
          .from('admin_users')
          .update({ password_hash: newHash })
          .eq('username', username);
        if (!error) return true;
      } catch (e) {
        console.warn('Supabase updateAdminPassword fallback:', e);
      }
    }

    const raw = localStorage.getItem(STORAGE_KEYS.LOCAL_ADMIN);
    const admin = raw ? JSON.parse(raw) : { username: 'admin' };
    admin.username = username;
    admin.password_hash = newHash;
    localStorage.setItem(STORAGE_KEYS.LOCAL_ADMIN, JSON.stringify(admin));
    return true;
  }

  // Get Admin Profile
  public getAdminProfile() {
    const raw = localStorage.getItem(STORAGE_KEYS.LOCAL_ADMIN);
    return raw ? JSON.parse(raw) : { username: 'admin', name: 'Administrator Utama OSIS' };
  }
}

export const supabaseService = new SupabaseService();
