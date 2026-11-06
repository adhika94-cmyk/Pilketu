<template>
  <div class="min-vh-100 d-flex flex-column bg-light">
    <!-- Navbar -->
    <Navbar />

    <div class="flex-grow-1 d-flex align-items-center justify-content-center p-3 py-5">
      <div class="w-100" style="max-width: 440px;">
        <div class="card-custom bg-white p-4 p-sm-5 border-0 shadow-lg rounded-4">
          <!-- Header -->
          <div class="text-center mb-4">
            <div class="d-inline-flex align-items-center justify-content-center bg-dark text-white rounded-circle p-3 mb-3 shadow-sm" style="width: 64px; height: 64px;">
              <i class="bi bi-shield-lock-fill fs-3 text-warning"></i>
            </div>
            <h4 class="fw-bold text-dark mb-1">Masuk Administrator</h4>
            <p class="text-secondary small mb-0">
              Panel Pengelolaan & Pemantauan Pemilihan eOSIS
            </p>
          </div>

          <!-- Error Alert -->
          <div v-if="errorMessage" class="alert alert-danger d-flex align-items-center gap-2 p-3 rounded-3 small mb-4">
            <i class="bi bi-exclamation-circle-fill fs-5 flex-shrink-0"></i>
            <div>{{ errorMessage }}</div>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleLogin">
            <div class="mb-3">
              <label for="username" class="form-label small fw-semibold text-dark">Username Admin</label>
              <div class="input-group">
                <span class="input-group-text bg-light border-end-0 text-muted">
                  <i class="bi bi-person"></i>
                </span>
                <input
                  id="username"
                  v-model="username"
                  type="text"
                  class="form-control bg-light border-start-0 py-2.5"
                  placeholder="Masukkan username"
                  required
                  autocomplete="username"
                />
              </div>
            </div>

            <div class="mb-4">
              <label for="password" class="form-label small fw-semibold text-dark">Password</label>
              <div class="input-group">
                <span class="input-group-text bg-light border-end-0 text-muted">
                  <i class="bi bi-key"></i>
                </span>
                <input
                  id="password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  class="form-control bg-light border-start-0 border-end-0 py-2.5"
                  placeholder="Masukkan password"
                  required
                  autocomplete="current-password"
                />
                <button
                  type="button"
                  class="input-group-text bg-light border-start-0 text-muted"
                  @click="showPassword = !showPassword"
                >
                  <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                </button>
              </div>
            </div>

            <button
              type="submit"
              class="btn btn-dark w-100 py-2.5 fw-semibold rounded-3 d-flex align-items-center justify-content-center gap-2 shadow-sm"
              :disabled="loading"
            >
              <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              <i v-else class="bi bi-box-arrow-in-right fs-5"></i>
              <span>{{ loading ? 'Memverifikasi...' : 'Masuk ke Dashboard' }}</span>
            </button>
          </form>

          <!-- Default credentials note -->
          <div class="mt-4 p-3 bg-light rounded-3 text-start small border">
            <div class="fw-bold text-dark d-flex align-items-center gap-1 mb-1">
              <i class="bi bi-info-circle text-primary"></i> Akun Bawaan (Default):
            </div>
            <div class="text-secondary font-monospace" style="font-size: 0.8rem;">
              Username: <strong class="text-dark">admin</strong><br />
              Password: <strong class="text-dark">admin123</strong>
            </div>
            <div class="mt-1" style="font-size: 0.72rem; color: #64748b;">
              Password dapat diganti kapan saja di menu Pengaturan.
            </div>
          </div>

          <div class="mt-4 text-center">
            <router-link to="/" class="text-decoration-none small text-muted d-inline-flex align-items-center gap-1">
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
import { useRouter, useRoute } from 'vue-router';
import Navbar from '../../components/Navbar.vue';
import { authState } from '../../services/auth';

const router = useRouter();
const route = useRoute();

const username = ref('admin');
const password = ref('admin123');
const showPassword = ref(false);
const loading = ref(false);
const errorMessage = ref('');

const handleLogin = async () => {
  errorMessage.value = '';
  loading.value = true;

  try {
    const success = await authState.loginAdmin(username.value, password.value);
    if (success) {
      const redirect = (route.query.redirect as string) || '/admin/beranda';
      router.push(redirect);
    } else {
      errorMessage.value = 'Username atau password admin salah.';
    }
  } catch (err: any) {
    errorMessage.value = err.message || 'Terjadi kesalahan saat masuk.';
  } finally {
    loading.value = false;
  }
};
</script>
