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
            <h4 class="fw-bold text-dark mb-0 fs-5">Manajemen Kelas</h4>
            <span class="text-muted small">Kelola data kelas dan pemetaan siswa</span>
          </div>
        </div>

        <button class="btn btn-primary btn-sm rounded-3 d-flex align-items-center gap-1 shadow-sm" @click="openAddModal">
          <i class="bi bi-plus-lg"></i>
          <span>Tambah Kelas</span>
        </button>
      </header>

      <!-- Content Area -->
      <main class="p-4 flex-grow-1">
        <!-- Search & Info Bar -->
        <div class="card-custom bg-white border p-3 mb-4 rounded-4 shadow-sm">
          <div class="row g-3 align-items-center">
            <div class="col-md-6">
              <div class="input-group">
                <span class="input-group-text bg-light border-end-0 text-muted">
                  <i class="bi bi-search"></i>
                </span>
                <input
                  v-model="searchQuery"
                  type="text"
                  class="form-control bg-light border-start-0"
                  placeholder="Cari nama kelas atau jurusan..."
                />
              </div>
            </div>
            <div class="col-md-6 text-md-end">
              <span class="badge bg-light text-secondary border py-2 px-3">
                Total: <strong>{{ filteredClasses.length }}</strong> Kelas
              </span>
            </div>
          </div>
        </div>

        <!-- Notification Alert -->
        <div v-if="alertMessage" class="alert alert-success alert-dismissible fade show rounded-3 p-3 mb-4" role="alert">
          <i class="bi bi-check-circle-fill me-2"></i> {{ alertMessage }}
          <button type="button" class="btn-close" @click="alertMessage = ''"></button>
        </div>

        <!-- Table of Classes -->
        <div class="card-custom bg-white border rounded-4 shadow-sm overflow-hidden">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light text-secondary small">
                <tr>
                  <th style="width: 60px;" class="text-center">#</th>
                  <th>Nama Kelas</th>
                  <th>Tingkat</th>
                  <th>Jurusan / Peminatan</th>
                  <th class="text-center">Jumlah Siswa</th>
                  <th class="text-end" style="width: 140px;">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(cls, index) in filteredClasses" :key="cls.id">
                  <td class="text-center text-muted small">{{ index + 1 }}</td>
                  <td>
                    <span class="fw-bold text-dark fs-6">{{ cls.name }}</span>
                  </td>
                  <td>
                    <span class="badge bg-primary-subtle text-primary rounded-pill px-2.5 py-1">
                      Kelas {{ cls.grade }}
                    </span>
                  </td>
                  <td>
                    <span class="text-secondary small">{{ cls.major }}</span>
                  </td>
                  <td class="text-center">
                    <span class="badge bg-light text-dark border px-2.5 py-1">
                      {{ getStudentCountByClass(cls.id) }} Siswa
                    </span>
                  </td>
                  <td class="text-end">
                    <div class="btn-group btn-group-sm">
                      <button class="btn btn-outline-secondary" title="Edit Kelas" @click="openEditModal(cls)">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-outline-danger" title="Hapus Kelas" @click="confirmDelete(cls)">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="filteredClasses.length === 0">
                  <td colspan="6" class="text-center py-5 text-muted">
                    <i class="bi bi-folder-x fs-1 d-block mb-2 text-secondary opacity-50"></i>
                    Tidak ada kelas yang ditemukan.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>

    <!-- Modal Form (Tambah / Edit Kelas) -->
    <div v-if="showModal" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(15, 23, 42, 0.65); backdrop-filter: blur(4px); z-index: 1055;">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div class="modal-header bg-primary text-white py-3 px-4">
            <h5 class="modal-title fw-bold">
              {{ isEditing ? 'Edit Data Kelas' : 'Tambah Kelas Baru' }}
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="closeModal"></button>
          </div>

          <form @submit.prevent="saveClass">
            <div class="modal-body p-4">
              <div class="mb-3">
                <label class="form-label small fw-semibold text-dark">Nama Kelas <span class="text-danger">*</span></label>
                <input
                  v-model="form.name"
                  type="text"
                  class="form-control"
                  placeholder="Contoh: X MIPA 1"
                  required
                />
              </div>

              <div class="row g-3 mb-3">
                <div class="col-sm-6">
                  <label class="form-label small fw-semibold text-dark">Tingkat <span class="text-danger">*</span></label>
                  <select v-model="form.grade" class="form-select" required>
                    <option value="" disabled>Pilih Tingkat</option>
                    <option value="X">Kelas X</option>
                    <option value="XI">Kelas XI</option>
                    <option value="XII">Kelas XII</option>
                  </select>
                </div>

                <div class="col-sm-6">
                  <label class="form-label small fw-semibold text-dark">Jurusan / Program <span class="text-danger">*</span></label>
                  <input
                    v-model="form.major"
                    type="text"
                    class="form-control"
                    placeholder="Contoh: MIPA, IPS, dll."
                    required
                  />
                </div>
              </div>
            </div>

            <div class="modal-footer bg-light border-top-0 px-4 py-3">
              <button type="button" class="btn btn-secondary rounded-3" @click="closeModal">Batal</button>
              <button type="submit" class="btn btn-primary rounded-3 px-4" :disabled="isSaving">
                {{ isSaving ? 'Menyimpan...' : (isEditing ? 'Simpan Perubahan' : 'Tambah Kelas') }}
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
import type { ClassItem, Student } from '../../types';

const sidebarOpen = ref(false);
const classes = ref<ClassItem[]>([]);
const students = ref<Student[]>([]);
const searchQuery = ref('');
const alertMessage = ref('');

const showModal = ref(false);
const isEditing = ref(false);
const isSaving = ref(false);
const currentEditId = ref<string | null>(null);

const form = ref({
  name: '',
  grade: 'X',
  major: 'MIPA'
});

const loadData = async () => {
  classes.value = await supabaseService.getClasses();
  students.value = await supabaseService.getStudents();
};

const filteredClasses = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  if (!query) return classes.value;
  return classes.value.filter(
    c => c.name.toLowerCase().includes(query) || c.major.toLowerCase().includes(query) || c.grade.toLowerCase().includes(query)
  );
});

const getStudentCountByClass = (classId: string) => {
  return students.value.filter(s => s.class_id === classId).length;
};

const openAddModal = () => {
  isEditing.value = false;
  currentEditId.value = null;
  form.value = { name: '', grade: 'X', major: 'MIPA' };
  showModal.value = true;
};

const openEditModal = (cls: ClassItem) => {
  isEditing.value = true;
  currentEditId.value = cls.id;
  form.value = {
    name: cls.name,
    grade: cls.grade,
    major: cls.major
  };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const saveClass = async () => {
  isSaving.value = true;
  try {
    if (isEditing.value && currentEditId.value) {
      await supabaseService.updateClass(currentEditId.value, {
        name: form.value.name,
        grade: form.value.grade,
        major: form.value.major,
      });
      alertMessage.value = `Kelas ${form.value.name} berhasil diperbarui.`;
    } else {
      await supabaseService.addClass({
        name: form.value.name,
        grade: form.value.grade,
        major: form.value.major,
      });
      alertMessage.value = `Kelas baru ${form.value.name} berhasil ditambahkan.`;
    }
    await loadData();
    closeModal();
  } catch (err: any) {
    alert(err.message || 'Gagal menyimpan kelas.');
  } finally {
    isSaving.value = false;
  }
};

const confirmDelete = async (cls: ClassItem) => {
  const count = getStudentCountByClass(cls.id);
  const warning = count > 0
    ? `Terdapat ${count} siswa di kelas ${cls.name}. Apakah Anda yakin ingin menghapus kelas ini?`
    : `Apakah Anda yakin ingin menghapus kelas ${cls.name}?`;

  if (confirm(warning)) {
    try {
      await supabaseService.deleteClass(cls.id);
      alertMessage.value = `Kelas ${cls.name} berhasil dihapus.`;
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus kelas.');
    }
  }
};

onMounted(() => {
  loadData();
});
</script>
