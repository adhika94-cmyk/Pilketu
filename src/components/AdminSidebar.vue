<template>
  <div>
    <!-- Backdrop for mobile -->
    <div
      v-if="isOpen"
      class="sidebar-backdrop position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-lg-none"
      style="z-index: 999;"
      @click="$emit('close')"
    ></div>

    <!-- Sidebar Container -->
    <aside class="admin-sidebar" :class="{ 'show': isOpen }">
      <!-- Brand & School Logo -->
      <div class="sidebar-brand">
        <img
          v-if="settings?.school_logo"
          :src="settings.school_logo"
          alt="Logo Sekolah"
          class="rounded"
          style="width: 38px; height: 38px; object-fit: cover;"
        />
        <div v-else class="bg-primary text-white rounded p-2 d-flex align-items-center justify-content-center" style="width: 38px; height: 38px;">
          <i class="bi bi-box-seam-fill fs-5"></i>
        </div>
        <div class="overflow-hidden flex-grow-1">
          <div class="fw-bold text-white fs-5 lh-1">eOSIS</div>
          <div class="text-truncate text-secondary small mt-1" :title="settings?.school_name">
            {{ settings?.school_name || 'Panel Admin' }}
          </div>
        </div>
        <ThemeToggle />
        <!-- Mobile close button -->
        <button class="btn btn-sm text-secondary d-lg-none ms-1" @click="$emit('close')">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <!-- Navigation Links -->
      <div class="py-3 flex-grow-1 overflow-y-auto">
        <div class="px-3 pb-2 text-uppercase text-secondary fw-semibold small" style="font-size: 0.72rem; letter-spacing: 0.05em;">
          Menu Utama
        </div>

        <router-link to="/admin/beranda" class="nav-link-custom" active-class="active" @click="handleNavClick">
          <i class="bi bi-grid-1x2"></i>
          <span>Beranda</span>
        </router-link>

        <router-link to="/admin/kelas" class="nav-link-custom" active-class="active" @click="handleNavClick">
          <i class="bi bi-diagram-3"></i>
          <span>Kelas</span>
        </router-link>

        <router-link to="/admin/siswa" class="nav-link-custom" active-class="active" @click="handleNavClick">
          <i class="bi bi-people"></i>
          <span>Siswa / Pemilih</span>
        </router-link>

        <router-link to="/admin/kandidat" class="nav-link-custom" active-class="active" @click="handleNavClick">
          <i class="bi bi-person-badge"></i>
          <span>Calon Kandidat</span>
        </router-link>

        <router-link to="/admin/perolehan-suara" class="nav-link-custom" active-class="active" @click="handleNavClick">
          <i class="bi bi-bar-chart-line"></i>
          <span>Perolehan Suara</span>
          <span class="badge bg-danger ms-auto rounded-pill px-2 py-1" style="font-size: 0.7rem;">Live</span>
        </router-link>

        <div class="px-3 pt-3 pb-2 text-uppercase text-secondary fw-semibold small" style="font-size: 0.72rem; letter-spacing: 0.05em;">
          Sistem
        </div>

        <router-link to="/admin/pengaturan" class="nav-link-custom" active-class="active" @click="handleNavClick">
          <i class="bi bi-gear"></i>
          <span>Pengaturan</span>
        </router-link>

        <button
          type="button"
          class="nav-link-custom text-danger border-0 bg-transparent w-100 text-start cursor-pointer"
          style="font: inherit;"
          @click.prevent="handleLogout"
        >
          <i class="bi bi-box-arrow-right"></i>
          <span>Keluar</span>
        </button>
      </div>

      <!-- Supabase Connection Badge & Info -->
      <div class="p-3 border-top border-dark-subtle bg-dark-subtle bg-opacity-25 mt-auto">
        <div class="d-flex align-items-center justify-content-between mb-2">
          <span class="small text-secondary fw-semibold">Status Database</span>
          <span v-if="isSupabaseConnected" class="badge bg-success-subtle text-success border border-success-subtle" style="font-size: 0.7rem;">
            <i class="bi bi-check-circle-fill me-1"></i>Supabase Aktif
          </span>
          <span v-else class="badge bg-warning-subtle text-warning border border-warning-subtle" style="font-size: 0.7rem;">
            <i class="bi bi-hdd-fill me-1"></i>Penyimpanan Lokal
          </span>
        </div>
        <div class="d-flex align-items-center justify-content-between mt-2 pt-2 border-top border-secondary border-opacity-25">
          <div class="small text-secondary text-truncate me-2" :title="adminUser?.username || 'Admin'">
            <i class="bi bi-person-circle me-1"></i> {{ adminUser?.username || 'Admin' }}
          </div>
          <button
            type="button"
            class="btn btn-outline-danger btn-sm py-1 px-2.5 rounded-3 d-flex align-items-center gap-1 small"
            style="font-size: 0.75rem;"
            @click.prevent="handleLogout"
          >
            <i class="bi bi-power"></i>
            <span>Keluar</span>
          </button>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { authState } from '../services/auth';
import { supabaseService } from '../services/supabase';
import ThemeToggle from './ThemeToggle.vue';
import type { SchoolSettings } from '../types';

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const router = useRouter();
const adminUser = authState.adminUser;
const settings = ref<SchoolSettings | null>(null);
const isSupabaseConnected = ref(false);

const handleNavClick = () => {
  emit('close');
};

const handleLogout = () => {
  if (window.confirm('Apakah Anda yakin ingin keluar dari panel admin eOSIS?')) {
    authState.logoutAdmin();
    emit('close');
    router.replace('/admin/login');
  }
};

onMounted(async () => {
  settings.value = await supabaseService.getSettings();
  isSupabaseConnected.value = supabaseService.isConnected;
});
</script>
