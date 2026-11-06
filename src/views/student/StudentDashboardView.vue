<template>
  <div class="min-vh-100 d-flex flex-column bg-light">
    <!-- Navbar -->
    <Navbar />

    <div class="container py-5 flex-grow-1">
      <div class="max-w-xl mx-auto" style="max-width: 680px;">
        <!-- Welcome banner -->
        <div class="card-custom bg-white p-4 p-sm-5 border-0 shadow-sm rounded-4 mb-4">
          <div class="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 pb-3 mb-4 border-bottom">
            <div>
              <span v-if="student?.voter_type === 'GURU'" class="badge bg-success-subtle text-success px-3 py-1 rounded-pill mb-1 fw-semibold small">
                <i class="bi bi-briefcase-fill me-1"></i> Pemilih: Guru / Tenaga Pendidik
              </span>
              <span v-else-if="student?.voter_type === 'STAFF'" class="badge bg-teal-subtle text-success px-3 py-1 rounded-pill mb-1 fw-semibold small" style="background-color: #ecfdf5;">
                <i class="bi bi-person-workspace me-1"></i> Pemilih: Staff / Tenaga Kependidikan
              </span>
              <span v-else class="badge bg-primary-subtle text-primary px-3 py-1 rounded-pill mb-1 fw-semibold small">
                <i class="bi bi-person-badge me-1"></i> Pemilih: Siswa
              </span>
              <h3 class="fw-bold text-dark mb-0">Biodata Pemilih</h3>
            </div>
            <button class="btn btn-outline-danger btn-sm align-self-start align-self-sm-center rounded-3" @click="handleLogout">
              <i class="bi bi-box-arrow-right me-1"></i> Keluar
            </button>
          </div>

          <!-- Student Profile Details -->
          <div class="row g-3 mb-4">
            <div class="col-sm-6">
              <div class="p-3 bg-light rounded-3">
                <div class="text-muted small fw-medium">Nama Lengkap</div>
                <div class="fs-6 fw-bold text-dark">{{ student?.name }}</div>
              </div>
            </div>

            <div class="col-sm-6">
              <div class="p-3 bg-light rounded-3">
                <div class="text-muted small fw-medium">
                  {{ student?.voter_type === 'GURU' ? 'NIP / NUPTK' : (student?.voter_type === 'STAFF' ? 'No. Pegawai / ID' : 'NISN') }}
                </div>
                <div class="fs-6 fw-bold text-dark font-monospace">{{ student?.nisn }}</div>
              </div>
            </div>

            <div class="col-sm-6">
              <div class="p-3 bg-light rounded-3">
                <div class="text-muted small fw-medium">
                  {{ student?.voter_type === 'GURU' || student?.voter_type === 'STAFF' ? 'Unit / Tugas' : 'Kelas' }}
                </div>
                <div class="fs-6 fw-bold text-dark">{{ student?.class_name || 'Tidak Terdaftar' }}</div>
              </div>
            </div>

            <div class="col-sm-6">
              <div class="p-3 bg-light rounded-3">
                <div class="text-muted small fw-medium">Tanggal Lahir</div>
                <div class="fs-6 fw-bold text-dark">{{ formatDate(student?.birth_date) }}</div>
              </div>
            </div>
          </div>

          <!-- Voting Status Box -->
          <div class="rounded-4 p-4 border" :class="student?.has_voted ? 'bg-success-subtle border-success-subtle' : 'bg-primary-subtle border-primary-subtle'">
            <div class="d-flex align-items-start gap-3">
              <div
                class="rounded-circle p-3 d-flex align-items-center justify-content-center text-white"
                :class="student?.has_voted ? 'bg-success' : 'bg-primary'"
                style="width: 54px; height: 54px; flex-shrink: 0;"
              >
                <i :class="student?.has_voted ? 'bi bi-check2-all fs-3' : 'bi bi-fingerprint fs-3'"></i>
              </div>

              <div class="flex-grow-1">
                <div class="d-flex flex-wrap align-items-center gap-2 mb-1">
                  <h5 class="fw-bold mb-0" :class="student?.has_voted ? 'text-success-emphasis' : 'text-primary-emphasis'">
                    Status Hak Suara:
                  </h5>
                  <span
                    class="badge rounded-pill px-3 py-1.5 fw-semibold"
                    :class="student?.has_voted ? 'bg-success text-white' : 'bg-warning text-dark'"
                  >
                    {{ student?.has_voted ? 'SUDAH MEMILIH' : 'BELUM MEMILIH' }}
                  </span>
                </div>

                <!-- Case 1: Student ALREADY voted -->
                <div v-if="student?.has_voted">
                  <p class="text-success-emphasis small mb-2">
                    <strong>Anda sudah menggunakan hak suara.</strong> Terima kasih atas partisipasi aktif Anda dalam Pemilihan Ketua dan Wakil Ketua OSIS.
                  </p>
                  <div v-if="student.voted_at" class="small text-muted">
                    <i class="bi bi-clock-history me-1"></i> Waktu Pemilihan: {{ formatDateTime(student.voted_at) }}
                  </div>
                  <div class="alert alert-light border mt-3 mb-0 small text-secondary">
                    <i class="bi bi-shield-lock-fill text-success me-1"></i>
                    Sesuai asas kerahasiaan pemilihan (LUBER JURDIL), suara Anda telah disimpan secara anonim di database dan tidak dapat diubah kembali.
                  </div>
                </div>

                <!-- Case 2: Student has NOT voted yet -->
                <div v-else>
                  <p class="text-primary-emphasis small mb-3">
                    Hak suara Anda masih aktif dan belum digunakan. Silakan masuk ke Bilik Suara untuk menentukan pilihan Anda. Setiap siswa hanya dapat memberikan suara 1 kali.
                  </p>

                  <router-link
                    to="/siswa/bilik-suara"
                    class="btn btn-primary px-4 py-2.5 rounded-3 fw-bold shadow-sm d-inline-flex align-items-center gap-2"
                  >
                    <i class="bi bi-box2-heart-fill fs-5"></i>
                    <span>Berikan Suara Sekarang</span>
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Navbar from '../../components/Navbar.vue';
import { authState } from '../../services/auth';
import { supabaseService } from '../../services/supabase';
import type { Student } from '../../types';

const router = useRouter();
const student = ref<Student | null>(authState.currentStudent.value);

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
};

const formatDateTime = (dateStr?: string) => {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateStr;
  }
};

const handleLogout = () => {
  authState.logoutStudent();
  router.push('/siswa/login');
};

onMounted(async () => {
  // Re-verify freshest data from service in case user voted in another tab
  if (student.value) {
    const fresh = await supabaseService.findStudentForLogin(student.value.nisn, student.value.birth_date);
    if (fresh) {
      student.value = fresh;
      sessionStorage.setItem('eosis_student_session', JSON.stringify(fresh));
    }
  }
});
</script>
