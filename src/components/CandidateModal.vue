<template>
  <div v-if="candidate" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(15, 23, 42, 0.7); backdrop-filter: blur(4px); z-index: 1055;">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
        <!-- Header with gradient and candidate number -->
        <div class="modal-header bg-primary text-white position-relative py-3 px-4">
          <div class="d-flex align-items-center gap-3">
            <span class="badge bg-white text-primary fs-5 px-3 py-2 rounded-pill shadow-sm">
              No. {{ candidate.order_number }}
            </span>
            <div>
              <h5 class="modal-title fw-bold mb-0">Pasangan Calon No. {{ candidate.order_number }}</h5>
              <div class="small opacity-75">Detail Visi, Misi & Program Unggulan</div>
            </div>
          </div>
          <button type="button" class="btn-close btn-close-white" @click="$emit('close')"></button>
        </div>

        <div class="modal-body p-4">
          <div class="row g-4">
            <!-- Candidate Photo & Names -->
            <div class="col-md-5 text-center">
              <div class="rounded-4 overflow-hidden shadow-sm mb-3 position-relative" style="max-height: 280px;">
                <img
                  :src="candidate.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'"
                  :alt="'Paslon ' + candidate.order_number"
                  class="w-100 h-100 object-fit-cover"
                  style="aspect-ratio: 4/5;"
                />
              </div>

              <div class="p-3 bg-light rounded-3 text-start">
                <div class="small text-muted text-uppercase fw-bold" style="font-size: 0.75rem;">Calon Ketua OSIS:</div>
                <div class="fw-bold fs-6 text-dark">{{ candidate.leader_name }}</div>

                <div class="small text-muted text-uppercase fw-bold mt-2" style="font-size: 0.75rem;">Calon Wakil Ketua OSIS:</div>
                <div class="fw-bold fs-6 text-dark">{{ candidate.vice_leader_name }}</div>
              </div>
            </div>

            <!-- Vision, Mission & Slogan -->
            <div class="col-md-7">
              <!-- Slogan banner -->
              <div v-if="candidate.slogan" class="alert alert-primary bg-primary-subtle border-0 rounded-3 mb-3 p-3">
                <div class="d-flex gap-2">
                  <i class="bi bi-quote fs-4 text-primary lh-1"></i>
                  <div class="fst-italic fw-medium text-primary-emphasis">{{ candidate.slogan }}</div>
                </div>
              </div>

              <!-- Vision -->
              <div class="mb-4">
                <h6 class="fw-bold text-dark d-flex align-items-center gap-2 mb-2">
                  <i class="bi bi-eye-fill text-primary"></i> Visi
                </h6>
                <div class="p-3 bg-light rounded-3 text-secondary lh-base">
                  {{ candidate.vision || 'Belum ada visi yang dicantumkan.' }}
                </div>
              </div>

              <!-- Mission list -->
              <div>
                <h6 class="fw-bold text-dark d-flex align-items-center gap-2 mb-2">
                  <i class="bi bi-list-check text-primary"></i> Misi
                </h6>
                <div v-if="candidate.mission && candidate.mission.length > 0" class="list-group list-group-flush rounded-3 border">
                  <div
                    v-for="(m, idx) in candidate.mission"
                    :key="idx"
                    class="list-group-item d-flex gap-2 align-items-start border-0 border-bottom py-2"
                  >
                    <span class="badge bg-primary-subtle text-primary rounded-pill mt-1">{{ idx + 1 }}</span>
                    <span class="text-secondary small lh-base">{{ m }}</span>
                  </div>
                </div>
                <div v-else class="text-muted small p-3 bg-light rounded-3">
                  Belum ada misi yang dicantumkan.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer bg-light border-top-0 px-4 py-3">
          <button type="button" class="btn btn-secondary px-4 rounded-3" @click="$emit('close')">
            Tutup
          </button>
          <button
            v-if="allowVote"
            type="button"
            class="btn btn-primary px-4 rounded-3 d-flex align-items-center gap-2"
            @click="$emit('select-and-vote', candidate)"
          >
            <i class="bi bi-check-circle-fill"></i>
            <span>Pilih Paslon Ini</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Candidate } from '../types';

defineProps<{
  candidate: Candidate | null;
  allowVote?: boolean;
}>();

defineEmits<{
  (e: 'close'): void;
  (e: 'select-and-vote', candidate: Candidate): void;
}>();
</script>
