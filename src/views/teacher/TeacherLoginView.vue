<template>
  <div class="min-vh-100 d-flex flex-column bg-light">
    <!-- Navbar -->
    <Navbar />

    <div class="flex-grow-1 d-flex align-items-center justify-content-center p-3 py-5">
      <div class="w-100" style="max-width: 480px;">
        <!-- Card Container -->
        <div class="card-custom bg-white p-4 p-sm-5 border-0 shadow-lg rounded-4">
          <!-- Header -->
          <div class="text-center mb-4">
            <div class="d-inline-flex align-items-center justify-content-center bg-teal-subtle text-teal rounded-circle p-3 mb-3 shadow-sm" style="width: 68px; height: 68px; background-color: #ecfdf5; color: #059669;">
              <i class="bi bi-briefcase-fill fs-2"></i>
            </div>
            <div class="badge bg-success-subtle text-success px-3 py-1 rounded-pill mb-2 fw-semibold">
              Kategori Guru & Tenaga Kependidikan
            </div>
            <h4 class="fw-bold text-dark mb-1">Masuk Pemilih Guru & Staff</h4>
            <p class="text-secondary small mb-0">
              Gunakan NIP / NUPTK / ID Pegawai dan Tanggal Lahir Anda yang terdaftar di sekolah.
            </p>
          </div>

          <!-- Alert message -->
          <div v-if="errorMessage" class="alert alert-danger d-flex align-items-center gap-2 p-3 rounded-3 small mb-4">
            <i class="bi bi-exclamation-circle-fill fs-5 flex-shrink-0"></i>
            <div>{{ errorMessage }}</div>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleLogin">
            <div class="mb-3">
              <label for="nip" class="form-label small fw-semibold text-dark">
                NIP / NUPTK / No. Pegawai
              </label>
              <div class="input-group">
                <span class="input-group-text bg-light border-end-0 text-muted">
                  <i class="bi bi-person-vcard"></i>
                </span>
                <input
                  id="nip"
                  v-model="nip"
                  type="text"
                  class="form-control bg-light border-start-0 py-2.5"
                  placeholder="Contoh: 198503152010011002"
                  required
                  autocomplete="username"
                />
              </div>
            </div>

            <div class="mb-4">
              <label for="birthDate" class="form-label small fw-semibold text-dark">
                Tanggal Lahir
              </label>
              <div class="input-group">
                <span class="input-group-text bg-light border-end-0 text-muted">
                  <i class="bi bi-calendar-date"></i>
                </span>
                <input
                  id="birthDate"
                  v-model="birthDate"
                  type="date"
                  class="form-control bg-light border-start-0 py-2.5"
                  required
                />
              </div>
              <div class="form-text small" style="font-size: 0.75rem;">
                Tanggal lahir sesuai biodata kepegawaian sekolah.
              </div>
            </div>

            <button
              type="submit"
              class="btn btn-success w-100 py-2.5 fw-semibold rounded-3 d-flex align-items-center justify-content-center gap-2 shadow-sm"
              :disabled="loading"
            >
              <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              <i v-else class="bi bi-box-arrow-in-right fs-5"></i>
              <span>{{ loading ? 'Memverifikasi...' : 'Masuk ke Bilik Suara Guru & Staff' }}</span>
            </button>
          </form>

          <!-- Quick Test Demo Logins for Teachers & Staff -->
          <div class="mt-4 pt-3 border-top text-center">
            <div class="small text-muted fw-semibold mb-2">Akun Uji Coba Guru & Staff (Klik Cepat):</div>
            <div class="d-flex flex-column gap-1.5">
              <button
                type="button"
                class="btn btn-sm btn-outline-success text-start d-flex justify-content-between align-items-center px-2 py-1.5 rounded-2"
                @click="setDemoAccount('198503152010011002', '1985-03-15')"
              >
                <div class="text-truncate">
                  <div class="fw-semibold">Drs. H. Bambang Suryono, M.Pd</div>
                  <div class="text-muted" style="font-size: 0.7rem;">Guru • Belum Memilih</div>
                </div>
                <span class="badge bg-success-subtle text-success ms-2">Pilih</span>
              </button>

              <button
                type="button"
                class="btn btn-sm btn-outline-primary text-start d-flex justify-content-between align-items-center px-2 py-1.5 rounded-2"
                @click="setDemoAccount('199207212019032014', '1992-07-21')"
              >
                <div class="text-truncate">
                  <div class="fw-semibold">Arief Budiman, S.Kom</div>
                  <div class="text-muted" style="font-size: 0.7rem;">Staff TU • Belum Memilih</div>
                </div>
                <span class="badge bg-primary-subtle text-primary ms-2">Pilih</span>
              </button>

              <button
                type="button"
                class="btn btn-sm btn-outline-secondary text-start d-flex justify-content-between align-items-center px-2 py-1.5 rounded-2"
                @click="setDemoAccount('199008242015022008', '1990-08-24')"
              >
                <div class="text-truncate">
                  <div class="fw-semibold">Siti Rahmawati, S.Pd</div>
                  <div class="text-muted" style="font-size: 0.7rem;">Guru • Sudah Memilih</div>
                </div>
                <span class="badge bg-secondary-subtle text-secondary ms-2">Pilih</span>
              </button>
            </div>
          </div>

          <!-- Switch to Student Login -->
          <div class="mt-4 pt-3 border-top text-center d-flex flex-column gap-2">
            <router-link to="/siswa/login" class="text-decoration-none small fw-semibold text-primary d-inline-flex align-items-center justify-content-center gap-1">
              <i class="bi bi-person-badge"></i> Anda Pemilih Siswa? Klik di Sini
            </router-link>
            <router-link to="/" class="text-decoration-none small text-muted d-inline-flex align-items-center justify-content-center gap-1">
              <i class="bi bi-arrow-left"></i> Kembali ke Beranda
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Navbar from '../../components/Navbar.vue';
import { authState } from '../../services/auth';

const router = useRouter();
const nip = ref('');
const birthDate = ref('');
const loading = ref(false);
const errorMessage = ref('');

const setDemoAccount = (demoNip: string, demoBirth: string) => {
  nip.value = demoNip;
  birthDate.value = demoBirth;
  errorMessage.value = '';
};

const handleLogin = async () => {
  errorMessage.value = '';
  loading.value = true;

  try {
    const result = await authState.loginStudent(nip.value, birthDate.value);
    if (result.success && result.student) {
      router.push('/siswa/dashboard');
    } else {
      errorMessage.value = result.message || 'NIP/NUPTK atau tanggal lahir tidak cocok dengan data pemilih.';
    }
  } catch (err: any) {
    errorMessage.value = err.message || 'Terjadi kesalahan sistem saat verifikasi.';
  } finally {
    loading.value = false;
  }
};
</script>
