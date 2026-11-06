<template>
  <div class="min-vh-100 d-flex flex-column bg-light position-relative">
    <!-- Navbar -->
    <Navbar />

    <!-- Success 4-second Celebration Overlay -->
    <div v-if="voteSuccess" class="vote-success-overlay p-4 text-center text-white">
      <div class="bg-white text-dark rounded-5 p-5 shadow-2xl max-w-lg mx-auto text-center" style="max-width: 520px;">
        <div class="mb-4">
          <div class="d-inline-flex align-items-center justify-content-center bg-success text-white rounded-circle p-4 shadow-lg animate-bounce" style="width: 90px; height: 90px;">
            <i class="bi bi-check-lg display-4"></i>
          </div>
        </div>

        <h3 class="fw-bold text-dark mb-2">Pilihan Berhasil Dicatat!</h3>
        <p class="fs-5 text-success fw-semibold mb-4">
          "Suara Anda berhasil dicatat, terima kasih telah berpartisipasi"
        </p>

        <div class="p-3 bg-light rounded-3 mb-4 text-muted small">
          <i class="bi bi-shield-lock-fill text-primary me-1"></i>
          Hak suara Anda telah digunakan dan disimpan secara anonim. Anda akan dialihkan ke halaman login dalam:
        </div>

        <!-- Countdown timer -->
        <div class="d-flex align-items-center justify-content-center gap-2">
          <span class="badge bg-primary fs-3 px-4 py-2 rounded-pill shadow-sm">
            {{ countdown }} detik
          </span>
        </div>
      </div>
    </div>

    <!-- Bilik Suara Header -->
    <div class="bg-white border-bottom py-4 shadow-sm">
      <div class="container">
        <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          <div>
            <div class="d-inline-flex align-items-center gap-2 px-3 py-1 bg-danger-subtle text-danger rounded-pill mb-2 fw-semibold small">
              <i class="bi bi-shield-lock-fill"></i>
              Bilik Suara Resmi Elektronik
            </div>
            <h2 class="fw-extrabold text-dark mb-1">Pilih Calon Ketua & Wakil Ketua OSIS</h2>
            <p class="text-secondary small mb-0">
              Pilihlah salah satu pasangan calon berdasarkan hati nurani Anda. Pilihan Anda bersifat rahasia.
            </p>
          </div>

          <!-- Voter info badge -->
          <div class="d-flex align-items-center gap-3 p-3 bg-light rounded-3 border">
            <div class="bg-primary text-white rounded-circle p-2 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
              <i class="bi bi-person-fill fs-5"></i>
            </div>
            <div>
              <div class="fw-bold text-dark small">{{ student?.name }}</div>
              <div class="text-muted small">
                {{ student?.voter_type === 'GURU' ? 'NIP' : (student?.voter_type === 'STAFF' ? 'ID Pegawai' : 'NISN') }}: {{ student?.nisn }} • {{ student?.class_name }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Candidate Selection Grid -->
    <div class="container py-5 flex-grow-1">
      <!-- Error alert -->
      <div v-if="errorMessage" class="alert alert-danger d-flex align-items-center gap-2 p-3 rounded-3 mb-4 shadow-sm">
        <i class="bi bi-exclamation-triangle-fill fs-4 flex-shrink-0"></i>
        <div class="fw-medium">{{ errorMessage }}</div>
      </div>

      <div class="row g-4 justify-content-center">
        <div
          v-for="candidate in candidates"
          :key="candidate.id"
          class="col-md-6 col-lg-4"
        >
          <div
            class="card-candidate h-100 position-relative"
            :class="{ 'selected': selectedCandidateForVote?.id === candidate.id }"
          >
            <!-- Large number badge -->
            <div class="candidate-number-badge">
              Nomor Urut {{ candidate.order_number }}
            </div>

            <!-- Candidate Photo -->
            <div class="position-relative overflow-hidden" style="height: 280px; background-color: #f1f5f9;">
              <img
                :src="candidate.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'"
                :alt="'Paslon ' + candidate.order_number"
                class="w-100 h-100 object-fit-cover"
              />
            </div>

            <!-- Content -->
            <div class="p-4 d-flex flex-column flex-grow-1">
              <div class="mb-3">
                <div class="small text-muted text-uppercase fw-semibold" style="font-size: 0.72rem;">Calon Ketua OSIS:</div>
                <h5 class="fw-bold text-dark mb-1">{{ candidate.leader_name }}</h5>

                <div class="small text-muted text-uppercase fw-semibold mt-2" style="font-size: 0.72rem;">Calon Wakil Ketua OSIS:</div>
                <h6 class="fw-semibold text-secondary mb-0">{{ candidate.vice_leader_name }}</h6>
              </div>

              <div v-if="candidate.slogan" class="alert alert-light border small text-muted fst-italic p-2.5 mb-3 rounded-3">
                "{{ candidate.slogan }}"
              </div>

              <!-- Action buttons -->
              <div class="mt-auto pt-3 d-flex flex-column gap-2">
                <button
                  type="button"
                  class="btn btn-outline-secondary btn-sm w-100 rounded-3 py-2 d-flex align-items-center justify-content-center gap-1"
                  @click="openCandidateDetail(candidate)"
                >
                  <i class="bi bi-info-circle"></i>
                  <span>Lihat Visi & Misi Lengkap</span>
                </button>

                <button
                  type="button"
                  class="btn btn-vote w-100 py-2.5 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-2"
                  @click="initiateVote(candidate)"
                >
                  <i class="bi bi-check-circle-fill fs-5"></i>
                  <span>PILIH PASLON INI</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Candidate Detail Modal -->
    <CandidateModal
      :candidate="detailCandidate"
      :allow-vote="true"
      @close="detailCandidate = null"
      @select-and-vote="handleSelectFromModal"
    />

    <!-- Vote Confirmation Modal -->
    <ConfirmModal
      :candidate="selectedCandidateForVote"
      :loading="isSubmitting"
      @confirm="executeVote"
      @cancel="selectedCandidateForVote = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import confetti from 'canvas-confetti';
import Navbar from '../../components/Navbar.vue';
import CandidateModal from '../../components/CandidateModal.vue';
import ConfirmModal from '../../components/ConfirmModal.vue';
import { authState } from '../../services/auth';
import { supabaseService } from '../../services/supabase';
import type { Candidate, Student } from '../../types';

const router = useRouter();
const student = ref<Student | null>(authState.currentStudent.value);
const candidates = ref<Candidate[]>([]);
const detailCandidate = ref<Candidate | null>(null);
const selectedCandidateForVote = ref<Candidate | null>(null);

const isSubmitting = ref(false);
const voteSuccess = ref(false);
const countdown = ref(4);
const errorMessage = ref('');

const openCandidateDetail = (cand: Candidate) => {
  detailCandidate.value = cand;
};

const handleSelectFromModal = (cand: Candidate) => {
  detailCandidate.value = null;
  initiateVote(cand);
};

const initiateVote = (cand: Candidate) => {
  errorMessage.value = '';
  selectedCandidateForVote.value = cand;
};

const executeVote = async (cand: Candidate) => {
  if (!student.value) {
    errorMessage.value = 'Sesi siswa tidak valid. Silakan login kembali.';
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = '';

  try {
    // Call Supabase RPC / Backend validation
    const result = await supabaseService.submitVote(student.value.id, cand.id);

    if (result.success) {
      // Mark local student status as voted immediately
      authState.updateStudentLocalVoteStatus();
      selectedCandidateForVote.value = null;
      voteSuccess.value = true;

      // Celebrate with confetti!
      triggerConfetti();

      // Start 4-second countdown
      countdown.value = 4;
      const timer = setInterval(() => {
        countdown.value -= 1;
        if (countdown.value <= 0) {
          clearInterval(timer);
          // Logout student session as requested
          authState.logoutStudent();
          router.push('/siswa/login');
        }
      }, 1000);
    } else {
      errorMessage.value = result.message || 'Gagal menyimpan suara.';
      selectedCandidateForVote.value = null;
      // If student already voted, redirect back to dashboard
      if (result.message?.includes('sudah menggunakan hak suara')) {
        setTimeout(() => {
          router.push('/siswa/dashboard');
        }, 2000);
      }
    }
  } catch (err: any) {
    errorMessage.value = err.message || 'Terjadi kesalahan sistem saat pemungutan suara.';
    selectedCandidateForVote.value = null;
  } finally {
    isSubmitting.value = false;
  }
};

const triggerConfetti = () => {
  try {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  } catch (e) {
    console.log('Confetti effect executed');
  }
};

onMounted(async () => {
  // Check if student has already voted before rendering booth
  if (!student.value) {
    router.push('/siswa/login');
    return;
  }

  // Refresh status from database
  const fresh = await supabaseService.findStudentForLogin(student.value.nisn, student.value.birth_date);
  if (fresh?.has_voted) {
    authState.updateStudentLocalVoteStatus();
    router.push('/siswa/dashboard');
    return;
  }

  candidates.value = await supabaseService.getCandidates();
});
</script>
