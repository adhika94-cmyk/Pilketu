<template>
  <nav class="navbar navbar-expand-lg border-bottom py-2 px-3 sticky-top shadow-sm" style="background-color: #578cf4;">
    <div class="container-fluid">
      <router-link to="/" class="navbar-brand d-flex align-items-center gap-2">
        <div v-if="settings?.school_logo" class="logo-box">
          <img :src="settings.school_logo" alt="Logo" class="school-logo rounded" />
        </div>
        <div v-else class="logo-box bg-primary text-white rounded d-flex align-items-center justify-content-center">
          <i class="bi bi-box-seam-fill"></i>
        </div>
        <div>
          <div class="fw-bold fs-5 text-dark lh-sm">eOSIS</div>
          <div class="text-muted small d-none d-sm-block">{{ settings?.school_name || 'Pemilihan Ketua OSIS' }}</div>
        </div>
      </router-link>

      <div class="d-flex align-items-center gap-2">
        <!-- Theme Toggle -->
        <ThemeToggle />

        <span class="badge bg-light text-dark border d-none d-md-inline-flex align-items-center gap-1 py-2 px-3">
          <i class="bi bi-calendar-event text-primary"></i>
          Periode {{ settings?.election_period || '2026/2027' }}
        </span>

        <span v-if="settings?.is_active" class="badge bg-success-subtle text-success border border-success-subtle d-inline-flex align-items-center gap-1 py-2 px-2">
          <span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true" style="width: 8px; height: 8px;"></span>
          Pemilihan Aktif
        </span>
        <span v-else class="badge bg-secondary-subtle text-secondary border d-inline-flex align-items-center gap-1 py-2 px-2">
          <i class="bi bi-lock-fill"></i> Pemilihan Ditutup
        </span>

        <div class="ms-1">
          <router-link v-if="!isAdminLoggedIn && !isStudentLoggedIn" to="/admin/login" class="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1">
            <i class="bi bi-shield-lock"></i>
            <span class="d-none d-sm-inline">Admin</span>
          </router-link>

          <router-link v-else-if="isAdminLoggedIn" to="/admin/beranda" class="btn btn-primary btn-sm d-flex align-items-center gap-1">
            <i class="bi bi-speedometer2"></i>
            <span>Dashboard Admin</span>
          </router-link>

          <router-link v-else-if="isStudentLoggedIn" to="/siswa/dashboard" class="btn btn-primary btn-sm d-flex align-items-center gap-1">
            <i class="bi bi-person-check"></i>
            <span>Profil Pemilih</span>
          </router-link>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { supabaseService } from '../services/supabase';
import { authState } from '../services/auth';
import ThemeToggle from './ThemeToggle.vue';
import type { SchoolSettings } from '../types';

const settings = ref<SchoolSettings | null>(null);
const isAdminLoggedIn = authState.isAdminLoggedIn;
const isStudentLoggedIn = authState.isStudentLoggedIn;

onMounted(async () => {
  settings.value = await supabaseService.getSettings();
});
</script>

<style scoped>
.logo-box {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.school-logo {
  width: 40px;
  height: 40px;
  object-fit: cover;
}
</style>
