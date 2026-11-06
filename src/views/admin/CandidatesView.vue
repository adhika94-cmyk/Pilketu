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
            <h4 class="fw-bold text-dark mb-0 fs-5">Calon Kandidat OSIS</h4>
            <span class="text-muted small">Kelola pasangan calon ketua & wakil ketua, foto, visi, misi, dan slogan</span>
          </div>
        </div>

        <button class="btn btn-primary btn-sm rounded-3 d-flex align-items-center gap-1 shadow-sm" @click="openAddModal">
          <i class="bi bi-plus-lg"></i>
          <span>Tambah Kandidat</span>
        </button>
      </header>

      <!-- Content Area -->
      <main class="p-4 flex-grow-1">
        <!-- Success Alert -->
        <div v-if="alertMessage" class="alert alert-success alert-dismissible fade show rounded-3 p-3 mb-4" role="alert">
          <i class="bi bi-check-circle-fill me-2"></i> {{ alertMessage }}
          <button type="button" class="btn-close" @click="alertMessage = ''"></button>
        </div>

        <!-- Candidate Cards Grid -->
        <div class="row g-4">
          <div
            v-for="candidate in candidates"
            :key="candidate.id"
            class="col-md-6 col-xl-4"
          >
            <div class="card-candidate h-100 position-relative bg-white border">
              <!-- Number badge -->
              <div class="candidate-number-badge">
                Nomor {{ candidate.order_number }}
              </div>

              <!-- Action buttons in top right -->
              <div class="position-absolute top-0 end-0 p-3 z-3">
                <div class="btn-group btn-group-sm shadow-sm rounded-3 overflow-hidden bg-white">
                  <button class="btn btn-light" title="Edit Paslon" @click="openEditModal(candidate)">
                    <i class="bi bi-pencil text-primary"></i>
                  </button>
                  <button class="btn btn-light" title="Hapus Paslon" @click="confirmDelete(candidate)">
                    <i class="bi bi-trash text-danger"></i>
                  </button>
                </div>
              </div>

              <!-- Photo -->
              <div class="overflow-hidden" style="height: 250px; background-color: #f1f5f9;">
                <img
                  :src="candidate.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'"
                  :alt="'Paslon ' + candidate.order_number"
                  class="w-100 h-100 object-fit-cover"
                />
              </div>

              <!-- Candidate Info -->
              <div class="p-4 d-flex flex-column flex-grow-1">
                <div class="mb-3">
                  <div class="small text-muted text-uppercase fw-semibold" style="font-size: 0.72rem;">Calon Ketua:</div>
                  <h5 class="fw-bold text-dark mb-1">{{ candidate.leader_name }}</h5>

                  <div class="small text-muted text-uppercase fw-semibold mt-2" style="font-size: 0.72rem;">Calon Wakil Ketua:</div>
                  <h6 class="fw-semibold text-secondary mb-0">{{ candidate.vice_leader_name }}</h6>
                </div>

                <div v-if="candidate.slogan" class="alert alert-light border small text-muted fst-italic p-2.5 mb-3 rounded-3">
                  "{{ candidate.slogan }}"
                </div>

                <!-- Vision excerpt -->
                <div class="mb-3">
                  <div class="fw-semibold text-dark small mb-1">Visi:</div>
                  <p class="text-secondary small mb-0 lh-sm text-truncate-2">
                    {{ candidate.vision || '-' }}
                  </p>
                </div>

                <!-- Mission count -->
                <div class="mt-auto pt-2 d-flex align-items-center justify-content-between text-muted small border-top">
                  <span><i class="bi bi-list-check me-1"></i> {{ candidate.mission?.length || 0 }} Poin Misi</span>
                  <span class="badge bg-primary-subtle text-primary">
                    {{ candidate.vote_count || 0 }} Suara ({{ candidate.percentage || 0 }}%)
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="candidates.length === 0" class="col-12">
            <div class="card-custom bg-white border p-5 text-center text-muted rounded-4">
              <i class="bi bi-people display-4 d-block mb-3 opacity-50"></i>
              <h5>Belum ada calon kandidat terdaftar</h5>
              <p class="small text-secondary mb-3">Klik tombol di bawah untuk mendaftarkan pasangan calon pertama.</p>
              <button class="btn btn-primary px-4 rounded-3" @click="openAddModal">
                <i class="bi bi-plus-lg me-1"></i> Tambah Kandidat Sekarang
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Modal Form (Tambah / Edit Calon Kandidat) -->
    <div v-if="showModal" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(15, 23, 42, 0.65); backdrop-filter: blur(4px); z-index: 1055;">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div class="modal-header bg-primary text-white py-3 px-4">
            <h5 class="modal-title fw-bold">
              {{ isEditing ? 'Edit Data Pasangan Calon' : 'Tambah Pasangan Calon Baru' }}
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="closeModal"></button>
          </div>

          <form @submit.prevent="saveCandidate">
            <div class="modal-body p-4 max-h-75 overflow-y-auto" style="max-height: 70vh;">
              <!-- Basic Info -->
              <div class="row g-3 mb-3">
                <div class="col-sm-4">
                  <label class="form-label small fw-semibold text-dark">Nomor Urut <span class="text-danger">*</span></label>
                  <input
                    v-model.number="form.order_number"
                    type="number"
                    min="1"
                    class="form-control"
                    required
                  />
                </div>

                <div class="col-sm-8">
                  <label class="form-label small fw-semibold text-dark">Slogan Paslon</label>
                  <input
                    v-model="form.slogan"
                    type="text"
                    class="form-control"
                    placeholder="Contoh: Bersinergi, Berprestasi, dan Berkarakter"
                  />
                </div>
              </div>

              <!-- Leader and Vice Leader -->
              <div class="row g-3 mb-3">
                <div class="col-sm-6">
                  <label class="form-label small fw-semibold text-dark">Nama Calon Ketua OSIS <span class="text-danger">*</span></label>
                  <input
                    v-model="form.leader_name"
                    type="text"
                    class="form-control"
                    placeholder="Nama calon ketua"
                    required
                  />
                </div>

                <div class="col-sm-6">
                  <label class="form-label small fw-semibold text-dark">Nama Calon Wakil Ketua OSIS <span class="text-danger">*</span></label>
                  <input
                    v-model="form.vice_leader_name"
                    type="text"
                    class="form-control"
                    placeholder="Nama calon wakil ketua"
                    required
                  />
                </div>
              </div>

              <!-- Photo Upload or URL -->
              <div class="mb-3">
                <label class="form-label small fw-semibold text-dark">Foto Pasangan Calon</label>
                <div class="input-group mb-2">
                  <span class="input-group-text bg-light border-end-0 text-muted">
                    <i class="bi bi-link-45deg"></i>
                  </span>
                  <input
                    v-model="form.photo_url"
                    type="text"
                    class="form-control bg-light border-start-0"
                    placeholder="Masukkan URL Foto atau upload file di bawah..."
                  />
                </div>

                <div class="d-flex align-items-center gap-3">
                  <input
                    type="file"
                    class="form-control form-control-sm"
                    accept="image/*"
                    @change="handleFileUpload"
                  />
                  <div v-if="form.photo_url" class="rounded overflow-hidden border flex-shrink-0" style="width: 48px; height: 48px;">
                    <img :src="form.photo_url" alt="Preview" class="w-100 h-100 object-fit-cover" />
                  </div>
                </div>
                <div class="form-text small" style="font-size: 0.72rem;">
                  Mendukung URL gambar HTTPS atau upload file langsung (disimpan di Supabase Storage / base64).
                </div>
              </div>

              <!-- Vision -->
              <div class="mb-3">
                <label class="form-label small fw-semibold text-dark">Visi Pasangan Calon <span class="text-danger">*</span></label>
                <textarea
                  v-model="form.vision"
                  rows="3"
                  class="form-control"
                  placeholder="Tuliskan visi kepemimpinan OSIS..."
                  required
                ></textarea>
              </div>

              <!-- Missions (Dynamic List) -->
              <div class="mb-3">
                <div class="d-flex align-items-center justify-content-between mb-2">
                  <label class="form-label small fw-semibold text-dark mb-0">Misi & Program Kerja</label>
                  <button type="button" class="btn btn-outline-primary btn-sm rounded-pill px-2 py-0.5" @click="addMissionItem">
                    <i class="bi bi-plus-lg me-1"></i> Tambah Misi
                  </button>
                </div>

                <div class="d-flex flex-column gap-2">
                  <div
                    v-for="(_m, idx) in form.mission"
                    :key="idx"
                    class="input-group"
                  >
                    <span class="input-group-text bg-light text-muted small fw-bold" style="width: 40px; justify-content: center;">
                      {{ idx + 1 }}
                    </span>
                    <input
                      v-model="form.mission[idx]"
                      type="text"
                      class="form-control"
                      placeholder="Poin misi..."
                      required
                    />
                    <button
                      type="button"
                      class="btn btn-outline-danger"
                      :disabled="form.mission.length <= 1"
                      @click="removeMissionItem(idx)"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-footer bg-light border-top-0 px-4 py-3">
              <button type="button" class="btn btn-secondary rounded-3" @click="closeModal">Batal</button>
              <button type="submit" class="btn btn-primary rounded-3 px-4" :disabled="isSaving">
                {{ isSaving ? 'Menyimpan...' : (isEditing ? 'Simpan Perubahan' : 'Tambah Calon') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import AdminSidebar from '../../components/AdminSidebar.vue';
import { supabaseService } from '../../services/supabase';
import type { Candidate } from '../../types';

const sidebarOpen = ref(false);
const candidates = ref<Candidate[]>([]);
const alertMessage = ref('');

const showModal = ref(false);
const isEditing = ref(false);
const isSaving = ref(false);
const currentEditId = ref<string | null>(null);

const form = ref({
  order_number: 1,
  leader_name: '',
  vice_leader_name: '',
  slogan: '',
  vision: '',
  mission: [''],
  photo_url: '',
});

const loadData = async () => {
  candidates.value = await supabaseService.getCandidates();
};

const addMissionItem = () => {
  form.value.mission.push('');
};

const removeMissionItem = (idx: number) => {
  if (form.value.mission.length > 1) {
    form.value.mission.splice(idx, 1);
  }
};

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      form.value.photo_url = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

const openAddModal = () => {
  isEditing.value = false;
  currentEditId.value = null;
  const nextOrder = candidates.value.length > 0
    ? Math.max(...candidates.value.map(c => c.order_number)) + 1
    : 1;

  form.value = {
    order_number: nextOrder,
    leader_name: '',
    vice_leader_name: '',
    slogan: '',
    vision: '',
    mission: [
      'Meningkatkan partisipasi aktif siswa dalam kegiatan sekolah.',
      'Menciptakan program kerja yang inovatif dan relevan dengan minat siswa.'
    ],
    photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
  };
  showModal.value = true;
};

const openEditModal = (cand: Candidate) => {
  isEditing.value = true;
  currentEditId.value = cand.id;
  form.value = {
    order_number: cand.order_number,
    leader_name: cand.leader_name,
    vice_leader_name: cand.vice_leader_name,
    slogan: cand.slogan || '',
    vision: cand.vision || '',
    mission: cand.mission && cand.mission.length > 0 ? [...cand.mission] : [''],
    photo_url: cand.photo_url || '',
  };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const saveCandidate = async () => {
  isSaving.value = true;
  const filteredMissions = form.value.mission.map(m => m.trim()).filter(Boolean);

  try {
    if (isEditing.value && currentEditId.value) {
      await supabaseService.updateCandidate(currentEditId.value, {
        order_number: form.value.order_number,
        leader_name: form.value.leader_name,
        vice_leader_name: form.value.vice_leader_name,
        slogan: form.value.slogan,
        vision: form.value.vision,
        mission: filteredMissions,
        photo_url: form.value.photo_url,
      });
      alertMessage.value = `Data Paslon No. ${form.value.order_number} berhasil diperbarui.`;
    } else {
      await supabaseService.addCandidate({
        order_number: form.value.order_number,
        leader_name: form.value.leader_name,
        vice_leader_name: form.value.vice_leader_name,
        slogan: form.value.slogan,
        vision: form.value.vision,
        mission: filteredMissions,
        photo_url: form.value.photo_url,
      });
      alertMessage.value = `Paslon baru No. ${form.value.order_number} berhasil ditambahkan.`;
    }
    await loadData();
    closeModal();
  } catch (err: any) {
    alert(err.message || 'Gagal menyimpan calon kandidat.');
  } finally {
    isSaving.value = false;
  }
};

const confirmDelete = async (cand: Candidate) => {
  if (confirm(`Apakah Anda yakin ingin menghapus Paslon No. ${cand.order_number} (${cand.leader_name} & ${cand.vice_leader_name})?`)) {
    try {
      await supabaseService.deleteCandidate(cand.id);
      alertMessage.value = `Paslon No. ${cand.order_number} berhasil dihapus.`;
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus calon.');
    }
  }
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
