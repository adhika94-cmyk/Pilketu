<template>
  <div v-if="candidate" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(15, 23, 42, 0.75); backdrop-filter: blur(6px); z-index: 1060;">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
        <div class="modal-body p-4 text-center">
          <div class="mb-3">
            <span class="d-inline-flex align-items-center justify-content-center bg-warning-subtle text-warning rounded-circle p-3" style="width: 72px; height: 72px;">
              <i class="bi bi-exclamation-triangle-fill fs-2"></i>
            </span>
          </div>

          <h5 class="fw-bold text-dark mb-2">Konfirmasi Hak Suara Anda</h5>
          <p class="text-secondary small mb-4">
            Pastikan pilihan Anda sudah sesuai. Pilihan tidak dapat diubah setelah suara dicatat dalam sistem.
          </p>

          <!-- Candidate summary card -->
          <div class="card bg-light border-0 rounded-4 p-3 mb-4 text-start">
            <div class="d-flex align-items-center gap-3">
              <div class="position-relative">
                <img
                  :src="candidate.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'"
                  :alt="'Paslon ' + candidate.order_number"
                  class="rounded-3 object-fit-cover shadow-sm"
                  style="width: 70px; height: 70px;"
                />
                <span class="position-absolute top-0 start-0 translate-middle badge rounded-pill bg-primary border border-white">
                  #{{ candidate.order_number }}
                </span>
              </div>
              <div class="overflow-hidden">
                <span class="badge bg-primary-subtle text-primary mb-1">Pasangan Calon No. {{ candidate.order_number }}</span>
                <div class="fw-bold text-dark text-truncate">{{ candidate.leader_name }}</div>
                <div class="text-muted small text-truncate">& {{ candidate.vice_leader_name }}</div>
              </div>
            </div>
          </div>

          <!-- Buttons -->
          <div class="d-grid gap-2">
            <button
              type="button"
              class="btn btn-primary py-2 fw-semibold rounded-3 d-flex align-items-center justify-content-center gap-2 shadow-sm"
              :disabled="loading"
              @click="$emit('confirm', candidate)"
            >
              <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              <i v-else class="bi bi-check2-circle fs-5"></i>
              <span>{{ loading ? 'Mencatat Suara Anda...' : 'Ya, Berikan Suara Saya' }}</span>
            </button>

            <button
              type="button"
              class="btn btn-outline-secondary py-2 rounded-3"
              :disabled="loading"
              @click="$emit('cancel')"
            >
              Batal & Periksa Kembali
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Candidate } from '../types';

defineProps<{
  candidate: Candidate | null;
  loading: boolean;
}>();

defineEmits<{
  (e: 'confirm', candidate: Candidate): void;
  (e: 'cancel'): void;
}>();
</script>
