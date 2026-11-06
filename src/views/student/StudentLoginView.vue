<template>
  <div class="min-vh-100 d-flex flex-column bg-light">
    <!-- Navbar -->
    <Navbar />

    <div class="flex-grow-1 d-flex align-items-center justify-content-center p-3 py-5">
      <div class="w-100" style="max-width: 460px;">
        <!-- Card Container -->
        <div class="card-custom bg-white p-4 p-sm-5 border-0 shadow-lg rounded-4">
          <!-- Header -->
          <div class="text-center mb-4">
            <div class="d-inline-flex align-items-center justify-content-center bg-primary text-white rounded-circle p-3 mb-3 shadow-sm" style="width: 64px; height: 64px;">
              <i class="bi bi-person-badge-fill fs-3"></i>
            </div>
            <h4 class="fw-bold text-dark mb-1">Masuk Pemilih Siswa</h4>
            <p class="text-secondary small mb-0">
              Gunakan NISN dan Tanggal Lahir Anda untuk masuk ke sistem eOSIS.
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
              <label for="nisn" class="form-label small fw-semibold text-dark">
                Nomor Induk Siswa Nasional (NISN)
              </label>
              <div class="input-group">
                <span class="input-group-text bg-light border-end-0 text-muted">
                  <i class="bi bi-card-text"></i>
                </span>
                <input
                  id="nisn"
                  v-model="nisn"
                  type="text"
                  class="form-control bg-light border-start-0 py-2.5"
                  placeholder="Contoh: 0071234001"
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
                Format tanggal lahir sesuai data buku induk sekolah.
              </div>
            </div>

            <button
              type="submit"
              class="btn btn-primary w-100 py-2.5 fw-semibold rounded-3 d-flex align-items-center justify-content-center gap-2 shadow-sm"
              :disabled="loading"
            >
              <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              <i v-else class="bi bi-box-arrow-in-right fs-5"></i>
              <span>{{ loading ? 'Memverifikasi...' : 'Masuk ke Bilik Suara' }}</span>
            </button>
          </form>

          <!-- Quick Test Demo Logins -->
          <div class="mt-4 pt-3 border-top text-center">
            <div class="small text-muted fw-semibold mb-2">Akun Uji Coba Demo (Klik Cepat):</div>
            <div class="d-flex flex-column gap-1.5">
              <button
                type="button"
                class="btn btn-sm btn-outline-success text-start d-flex justify-content-between align-items-center px-2 py-1.5 rounded-2"
                @click="setDemoAccount('0071234001', '2008-05-14')"
              >
                <span>Ahmad Raihan (Belum Memilih)</span>
                <span class="badge bg-success-subtle text-success">Pilih</span>
              </button>
              <button
                type="button"
                class="btn btn-sm btn-outline-secondary text-start d-flex justify-content-between align-items-center px-2 py-1.5 rounded-2"
                @click="setDemoAccount('0071234002', '2008-08-22')"
              >
                <span>Bella Anindita (Sudah Memilih)</span>
                <span class="badge bg-secondary-subtle text-secondary">Pilih</span>
              </button>
            </div>
          </div>

          <div class="mt-4 pt-3 border-top text-center d-flex flex-column gap-2">
            <router-link to="/guru-staff/login" class="text-decoration-none small fw-semibold text-success d-inline-flex align-items-center justify-content-center gap-1">
              <i class="bi bi-briefcase"></i> Anda Pemilih Guru atau Staff? Masuk di Sini
            </router-link>
            <router-link to="/" class="text-decoration-none small text-muted d-inline-flex align-items-center justify-content-center gap-1">
              <i class="bi bi-arrow-left"></i> Kembali ke Halaman Utama
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
const nisn = ref('');
const birthDate = ref('');
const loading = ref(false);
const errorMessage = ref('');

const setDemoAccount = (demoNisn: string, demoBirth: string) => {
  nisn.value = demoNisn;
  birthDate.value = demoBirth;
  errorMessage.value = '';
};

const handleLogin = async () => {
  errorMessage.value = '';
  loading.value = true;

  try {
    const result = await authState.loginStudent(nisn.value, birthDate.value);
    if (result.success && result.student) {
      router.push('/siswa/dashboard');
    } else {
      errorMessage.value = result.message || 'NISN atau tanggal lahir salah.';
    }
  } catch (err: any) {
    errorMessage.value = err.message || 'Terjadi kesalahan sistem saat verifikasi.';
  } finally {
    loading.value = false;
  }
};
</script>
