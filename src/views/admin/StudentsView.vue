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
            <h4 class="fw-bold text-dark mb-0 fs-5">Data Siswa / Pemilih</h4>
            <span class="text-muted small">Kelola data DPT siswa dan verifikasi status hak suara</span>
          </div>
        </div>

        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-outline-success btn-sm rounded-3 d-flex align-items-center gap-1" @click="addDemoTeacher">
            <i class="bi bi-briefcase"></i>
            <span class="d-none d-sm-inline">+ Tambah Guru/Staff Demo</span>
          </button>
          <button class="btn btn-outline-secondary btn-sm rounded-3 d-flex align-items-center gap-1" @click="addDemoStudents">
            <i class="bi bi-magic"></i>
            <span class="d-none d-sm-inline">+ Siswa Demo</span>
          </button>
          <button class="btn btn-primary btn-sm rounded-3 d-flex align-items-center gap-1 shadow-sm" @click="openAddModal">
            <i class="bi bi-person-plus-fill"></i>
            <span>Tambah Pemilih</span>
          </button>
        </div>
      </header>

      <!-- Content Area -->
      <main class="p-4 flex-grow-1">
        <!-- Filter & Search Toolbar -->
        <div class="card-custom bg-white border p-3 mb-4 rounded-4 shadow-sm">
          <div class="row g-3 align-items-center">
            <!-- Search -->
            <div class="col-md-4">
              <div class="input-group">
                <span class="input-group-text bg-light border-end-0 text-muted">
                  <i class="bi bi-search"></i>
                </span>
                <input
                  v-model="searchQuery"
                  type="text"
                  class="form-control bg-light border-start-0"
                  placeholder="Cari NISN, NIP, atau Nama..."
                />
              </div>
            </div>

            <!-- Filter Kategori Pemilih -->
            <div class="col-sm-6 col-md-3">
              <select v-model="filterCategory" class="form-select bg-light">
                <option value="all">Semua Kategori (Siswa & Guru)</option>
                <option value="SISWA">Hanya Siswa</option>
                <option value="GURU">Hanya Guru</option>
                <option value="STAFF">Hanya Staff</option>
              </select>
            </div>

            <!-- Filter Kelas / Unit -->
            <div class="col-sm-6 col-md-3">
              <select v-model="filterClass" class="form-select bg-light">
                <option value="">Semua Kelas / Unit</option>
                <option v-for="cls in classes" :key="cls.id" :value="cls.id">
                  {{ cls.name }}
                </option>
              </select>
            </div>

            <!-- Filter Status Memilih -->
            <div class="col-sm-6 col-md-2">
              <select v-model="filterStatus" class="form-select bg-light">
                <option value="all">Semua Status</option>
                <option value="voted">Sudah</option>
                <option value="unvoted">Belum</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Success Alert -->
        <div v-if="alertMessage" class="alert alert-success alert-dismissible fade show rounded-3 p-3 mb-4" role="alert">
          <i class="bi bi-check-circle-fill me-2"></i> {{ alertMessage }}
          <button type="button" class="btn-close" @click="alertMessage = ''"></button>
        </div>

        <!-- Anonymity info reminder -->
        <div class="alert alert-light border d-flex align-items-center gap-2 p-3 rounded-3 small mb-4 text-secondary">
          <i class="bi bi-shield-lock-fill text-primary fs-5 flex-shrink-0"></i>
          <div>
            <strong>Asas Rahasia:</strong> Kolom status hanya menampilkan apakah pemilih telah menggunakan hak pilihnya (Sudah / Belum). Pilihan kandidat dienkripsi secara anonim dan tidak disimpan bersama profil pemilih.
          </div>
        </div>

        <!-- Table of Voters (Students, Teachers, Staff) -->
        <div class="card-custom bg-white border rounded-4 shadow-sm overflow-hidden">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light text-secondary small">
                <tr>
                  <th style="width: 50px;" class="text-center">#</th>
                  <th>Kategori</th>
                  <th>NISN / NIP</th>
                  <th>Nama Lengkap</th>
                  <th>Tanggal Lahir</th>
                  <th>Kelas / Unit</th>
                  <th class="text-center">Status Memilih</th>
                  <th class="text-end" style="width: 140px;">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(student, index) in paginatedStudents" :key="student.id">
                  <td class="text-center text-muted small">{{ (currentPage - 1) * pageSize + index + 1 }}</td>
                  <td>
                    <span v-if="student.voter_type === 'GURU'" class="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2.5 py-1">
                      <i class="bi bi-briefcase-fill me-1"></i> Guru
                    </span>
                    <span v-else-if="student.voter_type === 'STAFF'" class="badge bg-info-subtle text-info border border-info-subtle rounded-pill px-2.5 py-1">
                      <i class="bi bi-person-workspace me-1"></i> Staff
                    </span>
                    <span v-else class="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-2.5 py-1">
                      <i class="bi bi-person me-1"></i> Siswa
                    </span>
                  </td>
                  <td>
                    <span class="font-monospace fw-semibold text-dark">{{ student.nisn }}</span>
                  </td>
                  <td>
                    <div class="fw-bold text-dark">{{ student.name }}</div>
                    <span class="text-muted small" style="font-size: 0.75rem;">
                      {{ student.gender === 'L' ? 'Laki-laki' : 'Perempuan' }}
                    </span>
                  </td>
                  <td>
                    <span class="text-secondary small">{{ formatDate(student.birth_date) }}</span>
                  </td>
                  <td>
                    <span class="badge bg-light text-dark border px-2.5 py-1">
                      {{ student.class_name || 'Tanpa Kelas' }}
                    </span>
                  </td>
                  <td class="text-center">
                    <span
                      v-if="student.has_voted"
                      class="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3 py-1.5 fw-semibold"
                    >
                      <i class="bi bi-check2-circle me-1"></i> Sudah Memilih
                    </span>
                    <span
                      v-else
                      class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle rounded-pill px-3 py-1.5 fw-semibold"
                    >
                      <i class="bi bi-hourglass-split me-1"></i> Belum Memilih
                    </span>
                  </td>
                  <td class="text-end">
                    <div class="btn-group btn-group-sm">
                      <button class="btn btn-outline-secondary" title="Edit Data Siswa" @click="openEditModal(student)">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-outline-danger" title="Hapus Siswa" @click="confirmDelete(student)">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="filteredStudents.length === 0">
                  <td colspan="7" class="text-center py-5 text-muted">
                    <i class="bi bi-person-x fs-1 d-block mb-2 text-secondary opacity-50"></i>
                    Tidak ada data siswa yang cocok dengan filter.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="d-flex align-items-center justify-content-between p-3 border-top bg-light">
            <span class="small text-muted">
              Menampilkan {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, filteredStudents.length) }} dari {{ filteredStudents.length }} siswa
            </span>
            <div class="btn-group btn-group-sm">
              <button
                class="btn btn-outline-secondary"
                :disabled="currentPage === 1"
                @click="currentPage--"
              >
                <i class="bi bi-chevron-left"></i>
              </button>
              <button
                v-for="page in totalPages"
                :key="page"
                class="btn"
                :class="page === currentPage ? 'btn-primary' : 'btn-outline-secondary'"
                @click="currentPage = page"
              >
                {{ page }}
              </button>
              <button
                class="btn btn-outline-secondary"
                :disabled="currentPage === totalPages"
                @click="currentPage++"
              >
                <i class="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Modal Form (Tambah / Edit Pemilih: Siswa, Guru, Staff) -->
    <div v-if="showModal" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(15, 23, 42, 0.65); backdrop-filter: blur(4px); z-index: 1055;">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div class="modal-header bg-primary text-white py-3 px-4">
            <h5 class="modal-title fw-bold">
              {{ isEditing ? 'Edit Data Pemilih' : 'Tambah Pemilih Baru' }}
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="closeModal"></button>
          </div>

          <form @submit.prevent="saveStudent">
            <div class="modal-body p-4">
              <!-- Kategori Pemilih -->
              <div class="mb-3">
                <label class="form-label small fw-semibold text-dark">Kategori Pemilih <span class="text-danger">*</span></label>
                <select v-model="form.voter_type" class="form-select" @change="onCategoryChange" required>
                  <option value="SISWA">Siswa (Peserta Didik)</option>
                  <option value="GURU">Guru (Tenaga Pendidik)</option>
                  <option value="STAFF">Staff (Tata Usaha / Karyawan)</option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label small fw-semibold text-dark">
                  {{ form.voter_type === 'GURU' ? 'NIP / NUPTK' : (form.voter_type === 'STAFF' ? 'ID / No. Pegawai' : 'NISN (Nomor Induk Siswa)') }}
                  <span class="text-danger">*</span>
                </label>
                <input
                  v-model="form.nisn"
                  type="text"
                  class="form-control"
                  :placeholder="form.voter_type === 'GURU' ? 'Contoh: 198503152010011002' : 'Contoh: 0071234011'"
                  required
                />
              </div>

              <div class="mb-3">
                <label class="form-label small fw-semibold text-dark">Nama Lengkap <span class="text-danger">*</span></label>
                <input
                  v-model="form.name"
                  type="text"
                  class="form-control"
                  placeholder="Contoh: Drs. Bambang Suryono / Kayla Nathania"
                  required
                />
              </div>

              <div class="row g-3 mb-3">
                <div class="col-sm-6">
                  <label class="form-label small fw-semibold text-dark">Tanggal Lahir <span class="text-danger">*</span></label>
                  <input
                    v-model="form.birth_date"
                    type="date"
                    class="form-control"
                    required
                  />
                </div>

                <div class="col-sm-6">
                  <label class="form-label small fw-semibold text-dark">Jenis Kelamin <span class="text-danger">*</span></label>
                  <select v-model="form.gender" class="form-select" required>
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label small fw-semibold text-dark">
                  {{ form.voter_type === 'GURU' || form.voter_type === 'STAFF' ? 'Unit / Penugasan' : 'Kelas' }}
                  <span class="text-danger">*</span>
                </label>
                <select v-model="form.class_id" class="form-select" required>
                  <option value="" disabled>Pilih Kelas / Unit</option>
                  <option v-for="cls in classes" :key="cls.id" :value="cls.id">
                    {{ cls.name }} ({{ cls.grade }})
                  </option>
                </select>
              </div>

              <!-- Only when editing: option to reset vote status if testing needed -->
              <div v-if="isEditing" class="p-3 bg-light rounded-3 border">
                <div class="form-check form-switch mb-0">
                  <input
                    id="hasVotedSwitch"
                    v-model="form.has_voted"
                    class="form-check-input"
                    type="checkbox"
                  />
                  <label class="form-check-label small fw-semibold text-dark" for="hasVotedSwitch">
                    Status: {{ form.has_voted ? 'Sudah Memilih' : 'Belum Memilih' }}
                  </label>
                </div>
              </div>
            </div>

            <div class="modal-footer bg-light border-top-0 px-4 py-3">
              <button type="button" class="btn btn-secondary rounded-3" @click="closeModal">Batal</button>
              <button type="submit" class="btn btn-primary rounded-3 px-4" :disabled="isSaving">
                {{ isSaving ? 'Menyimpan...' : (isEditing ? 'Simpan Perubahan' : 'Tambah Pemilih') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import AdminSidebar from '../../components/AdminSidebar.vue';
import { supabaseService } from '../../services/supabase';
import type { Student, ClassItem, VoterType } from '../../types';

const sidebarOpen = ref(false);
const students = ref<Student[]>([]);
const classes = ref<ClassItem[]>([]);
const searchQuery = ref('');
const filterCategory = ref<'all' | VoterType>('all');
const filterClass = ref('');
const filterStatus = ref<'all' | 'voted' | 'unvoted'>('all');
const alertMessage = ref('');

const currentPage = ref(1);
const pageSize = 10;

const showModal = ref(false);
const isEditing = ref(false);
const isSaving = ref(false);
const currentEditId = ref<string | null>(null);

const form = ref({
  voter_type: 'SISWA' as VoterType,
  nisn: '',
  name: '',
  birth_date: '2008-01-01',
  gender: 'L' as 'L' | 'P',
  class_id: '',
  has_voted: false
});

const onCategoryChange = () => {
  if (form.value.voter_type === 'GURU') {
    const guruClass = classes.value.find(c => c.id === 'cls-guru' || c.grade === 'Guru');
    if (guruClass) form.value.class_id = guruClass.id;
  } else if (form.value.voter_type === 'STAFF') {
    const staffClass = classes.value.find(c => c.id === 'cls-staff' || c.grade === 'Staff');
    if (staffClass) form.value.class_id = staffClass.id;
  } else {
    const studentClass = classes.value.find(c => c.grade !== 'Guru' && c.grade !== 'Staff');
    if (studentClass) form.value.class_id = studentClass.id;
  }
};

const loadData = async () => {
  students.value = await supabaseService.getStudents();
  classes.value = await supabaseService.getClasses();
  if (classes.value.length > 0 && !form.value.class_id) {
    form.value.class_id = classes.value[0].id;
  }
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
};

const filteredStudents = computed(() => {
  let list = students.value;
  const query = searchQuery.value.toLowerCase().trim();

  if (query) {
    list = list.filter(
      s => s.name.toLowerCase().includes(query) || s.nisn.includes(query)
    );
  }

  if (filterCategory.value !== 'all') {
    list = list.filter(s => (s.voter_type || 'SISWA') === filterCategory.value);
  }

  if (filterClass.value) {
    list = list.filter(s => s.class_id === filterClass.value);
  }

  if (filterStatus.value === 'voted') {
    list = list.filter(s => s.has_voted);
  } else if (filterStatus.value === 'unvoted') {
    list = list.filter(s => !s.has_voted);
  }

  return list;
});

const totalPages = computed(() => {
  return Math.ceil(filteredStudents.value.length / pageSize) || 1;
});

const paginatedStudents = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredStudents.value.slice(start, start + pageSize);
});

const openAddModal = () => {
  isEditing.value = false;
  currentEditId.value = null;
  form.value = {
    voter_type: 'SISWA',
    nisn: '',
    name: '',
    birth_date: '2008-01-01',
    gender: 'L',
    class_id: classes.value.find(c => c.grade !== 'Guru' && c.grade !== 'Staff')?.id || classes.value[0]?.id || '',
    has_voted: false
  };
  showModal.value = true;
};

const openEditModal = (std: Student) => {
  isEditing.value = true;
  currentEditId.value = std.id;
  form.value = {
    voter_type: std.voter_type || 'SISWA',
    nisn: std.nisn,
    name: std.name,
    birth_date: std.birth_date,
    gender: std.gender,
    class_id: std.class_id,
    has_voted: std.has_voted
  };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const saveStudent = async () => {
  isSaving.value = true;
  try {
    if (isEditing.value && currentEditId.value) {
      await supabaseService.updateStudent(currentEditId.value, {
        nisn: form.value.nisn,
        name: form.value.name,
        birth_date: form.value.birth_date,
        gender: form.value.gender,
        class_id: form.value.class_id,
        voter_type: form.value.voter_type,
        has_voted: form.value.has_voted,
      });
      alertMessage.value = `Data pemilih ${form.value.name} berhasil diperbarui.`;
    } else {
      await supabaseService.addStudent({
        nisn: form.value.nisn,
        name: form.value.name,
        birth_date: form.value.birth_date,
        gender: form.value.gender,
        class_id: form.value.class_id,
        voter_type: form.value.voter_type,
      });
      alertMessage.value = `Pemilih baru ${form.value.name} berhasil ditambahkan.`;
    }
    await loadData();
    closeModal();
  } catch (err: any) {
    alert(err.message || 'Gagal menyimpan data pemilih.');
  } finally {
    isSaving.value = false;
  }
};

const confirmDelete = async (std: Student) => {
  if (confirm(`Apakah Anda yakin ingin menghapus data pemilih ${std.name} (${std.nisn})?`)) {
    try {
      await supabaseService.deleteStudent(std.id);
      alertMessage.value = `Data pemilih ${std.name} berhasil dihapus.`;
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus pemilih.');
    }
  }
};

const addDemoStudents = async () => {
  const defaultClass = classes.value.find(c => c.grade !== 'Guru' && c.grade !== 'Staff')?.id || classes.value[0]?.id || '';
  const newDemo = [
    { nisn: '0071234020', name: 'Zahra Amelia', birth_date: '2008-04-11', gender: 'P' as const, class_id: defaultClass, voter_type: 'SISWA' as const },
    { nisn: '0071234021', name: 'Rizky Alamsyah', birth_date: '2008-09-24', gender: 'L' as const, class_id: defaultClass, voter_type: 'SISWA' as const },
  ];

  try {
    for (const d of newDemo) {
      try {
        await supabaseService.addStudent(d);
      } catch {}
    }
    alertMessage.value = '2 siswa uji coba baru berhasil ditambahkan!';
    await loadData();
  } catch (e: any) {
    alert('Siswa demo sudah ada dalam database.');
  }
};

const addDemoTeacher = async () => {
  const guruClass = classes.value.find(c => c.id === 'cls-guru' || c.grade === 'Guru')?.id || classes.value[0]?.id || '';
  const staffClass = classes.value.find(c => c.id === 'cls-staff' || c.grade === 'Staff')?.id || classes.value[0]?.id || '';

  const newDemo = [
    { nisn: '198704122014011005', name: 'Dra. Hj. Nurul Hidayah, M.Pd', birth_date: '1987-04-12', gender: 'P' as const, class_id: guruClass, voter_type: 'GURU' as const },
    { nisn: '199506182020121009', name: 'Hendra Setiawan, S.Pd', birth_date: '1995-06-18', gender: 'L' as const, class_id: guruClass, voter_type: 'GURU' as const },
    { nisn: '199311052021031002', name: 'Budi Santoso, A.Md', birth_date: '1993-11-05', gender: 'L' as const, class_id: staffClass, voter_type: 'STAFF' as const },
  ];

  try {
    for (const d of newDemo) {
      try {
        await supabaseService.addStudent(d);
      } catch {}
    }
    alertMessage.value = '3 akun guru & staff uji coba baru berhasil ditambahkan!';
    await loadData();
  } catch (e: any) {
    alert('Data guru/staff demo sudah ada dalam database.');
  }
};

onMounted(() => {
  loadData();
});
</script>
