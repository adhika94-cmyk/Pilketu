<template>
  <div class="min-vh-100 d-flex flex-column bg-light">
    <!-- Navbar -->
    <Navbar />

    <!-- Hero Section -->
    <section class="py-5 border-bottom position-relative overflow-hidden" style="background-color: #13edba;">
      <div class="container py-lg-4">
        <div class="row align-items-center g-5">
          <div class="col-lg-7 text-center text-lg-start">
            <div class="d-inline-flex align-items-center gap-2 px-3 py-1 bg-primary-subtle text-primary rounded-pill mb-3 fw-semibold small">
              <i class="bi bi-shield-check"></i>
              Pemilihan OSIS Resmi & Terverifikasi
            </div>

            <h1 class="display-5 fw-extrabold text-dark tracking-tight mb-3">
              Suara Anda Menentukan Masa Depan <span class="text-primary">OSIS</span>
            </h1>

            <p class="lead text-secondary mb-4 fs-6">
              Selamat datang di portal pemilihan ketua dan wakil ketua OSIS <strong>{{ settings?.school_name }}</strong> periode <strong>{{ settings?.election_period }}</strong>. Gunakan hak pilih Anda secara LUBERJURDIL (Langsung, Umum, Bebas, Rahasia, Jujur, dan Adil).
            </p>

            <!-- Quick Action Buttons -->
            <div class="d-flex flex-column flex-sm-row flex-wrap gap-3 justify-content-center justify-content-lg-start">
              <template v-if="!isStudentLoggedIn">
                <!-- Tombol Pemilih Siswa -->
                <router-link
                  to="/siswa/login"
                  class="btn btn-primary btn-lg px-4 py-3 rounded-4 shadow-sm d-flex align-items-center justify-content-center gap-2 fw-semibold"
                >
                  <i class="bi bi-person-badge-fill fs-5"></i>
                  <span>Masuk Pemilih Siswa</span>
                </router-link>

                <!-- Tombol Khusus Pemilih Guru & Staff -->
                <router-link
                  to="/guru-staff/login"
                  class="btn btn-success btn-lg px-4 py-3 rounded-4 shadow-sm d-flex align-items-center justify-content-center gap-2 fw-semibold"
                  style="background-color: #059669; border-color: #059669;"
                >
                  <i class="bi bi-briefcase-fill fs-5"></i>
                  <span>Masuk Pemilih Guru & Staff</span>
                </router-link>
              </template>

              <router-link
                v-else
                to="/siswa/dashboard"
                class="btn btn-success btn-lg px-4 py-3 rounded-4 shadow-sm d-flex align-items-center justify-content-center gap-2 fw-semibold"
              >
                <i class="bi bi-person-check-fill fs-5"></i>
                <span>Bilik Suara Saya</span>
              </router-link>

              <router-link
                v-if="!isAdminLoggedIn"
                to="/admin/login"
                class="btn btn-outline-secondary btn-lg px-4 py-3 rounded-4 d-flex align-items-center justify-content-center gap-2 fw-semibold"
              >
                <i class="bi bi-shield-lock-fill fs-5"></i>
                <span>Portal Admin</span>
              </router-link>
              <router-link
                v-else
                to="/admin/beranda"
                class="btn btn-outline-primary btn-lg px-4 py-3 rounded-4 d-flex align-items-center justify-content-center gap-2 fw-semibold"
              >
                <i class="bi bi-speedometer2 fs-5"></i>
                <span>Dashboard Admin</span>
              </router-link>
            </div>

            <!-- Election timeline badge -->
            <div class="mt-4 pt-2 d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start gap-4 text-muted small">
              <div class="d-flex align-items-center gap-2">
                <i class="bi bi-calendar-check text-primary fs-5"></i>
                <span>Mulai: <strong>{{ formatDate(settings?.start_date) }}</strong></span>
              </div>
              <div class="d-flex align-items-center gap-2">
                <i class="bi bi-hourglass-split text-warning fs-5"></i>
                <span>Berakhir: <strong>{{ formatDate(settings?.end_date) }}</strong></span>
              </div>
            </div>
          </div>

          <!-- Hero Graphic / Realtime Participation Widget -->
          <div class="col-lg-5">
            <div class="card-custom p-4 border shadow-sm rounded-4" style="background-color: #f5ec3f;">
              <div class="d-flex align-items-center justify-content-between mb-3">
                <span class="fw-bold text-dark fs-5">Statistik Pemilihan</span>
                <span class="badge bg-danger rounded-pill px-2.5 py-1.5 animate-pulse">
                  <i class="bi bi-broadcast me-1"></i> Live
                </span>
              </div>

              <!-- Participation Progress -->
              <div class="mb-4">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <span class="text-secondary small fw-medium">Tingkat Partisipasi Siswa</span>
                  <span class="fw-bold text-primary">{{ stats.participationRate }}%</span>
                </div>
                <div class="progress" style="height: 12px; border-radius: 999px;">
                  <div
                    class="progress-bar bg-primary progress-bar-striped progress-bar-animated"
                    role="progressbar"
                    :style="{ width: stats.participationRate + '%' }"
                    :aria-valuenow="stats.participationRate"
                    aria-valuemin="0"
                    aria-valuemax="100"
                  ></div>
                </div>
              </div>

              <!-- 3 Mini Stats -->
              <div class="row g-2 text-center mb-3">
                <div class="col-4">
                  <div class="p-2.5 bg-light rounded-3">
                    <div class="fs-4 fw-bold text-dark">{{ stats.totalStudents }}</div>
                    <div class="text-muted small" style="font-size: 0.75rem;">Total Pemilih</div>
                  </div>
                </div>
                <div class="col-4">
                  <div class="p-2.5 bg-success-subtle rounded-3">
                    <div class="fs-4 fw-bold text-success">{{ stats.votedStudents }}</div>
                    <div class="text-success small" style="font-size: 0.75rem;">Sudah Memilih</div>
                  </div>
                </div>
                <div class="col-4">
                  <div class="p-2.5 bg-warning-subtle rounded-3">
                    <div class="fs-4 fw-bold text-warning-emphasis">{{ stats.unvotedStudents }}</div>
                    <div class="text-warning-emphasis small" style="font-size: 0.75rem;">Belum Memilih</div>
                  </div>
                </div>
              </div>

              <div class="p-3 bg-primary-subtle text-primary rounded-3 small d-flex gap-2 align-items-center">
                <i class="bi bi-info-circle-fill fs-5"></i>
                <span>Gunakan NISN & Tanggal Lahir untuk masuk ke bilik suara elektronik.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Candidate List Showcase -->
    <section class="py-5" style="background-color: #578cf4;">
      <div class="container">
        <div class="text-center max-w-xl mx-auto mb-5">
          <span class="badge bg-primary-subtle text-primary px-3 py-1 rounded-pill mb-2 fw-semibold">
            Kandidat Resmi
          </span>
          <h2 class="fw-bold text-dark">Daftar Pasangan Calon Ketua & Wakil Ketua OSIS</h2>
          <p class="text-secondary small">
            Kenali profil, visi, dan misi para calon sebelum menentukan pilihan Anda.
          </p>
        </div>

        <div class="row g-4 justify-content-center">
          <div
            v-for="candidate in candidates"
            :key="candidate.id"
            class="col-md-6 col-lg-4"
          >
            <div class="card-candidate h-100 position-relative">
              <!-- Number badge -->
              <div class="candidate-number-badge">
                Nomor {{ candidate.order_number }}
              </div>

              <!-- Photo -->
              <div class="overflow-hidden" style="height: 240px; background-color: #f1f5f9;">
                <img
                  :src="candidate.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'"
                  :alt="'Paslon ' + candidate.order_number"
                  class="w-100 h-100 object-fit-cover"
                />
              </div>

              <!-- Info -->
              <div class="p-4 d-flex flex-column flex-grow-1">
                <div class="mb-3">
                  <div class="small text-muted text-uppercase fw-semibold" style="font-size: 0.72rem;">Calon Ketua:</div>
                  <h5 class="fw-bold text-dark mb-1">{{ candidate.leader_name }}</h5>

                  <div class="small text-muted text-uppercase fw-semibold mt-2" style="font-size: 0.72rem;">Calon Wakil:</div>
                  <h6 class="fw-semibold text-secondary mb-0">{{ candidate.vice_leader_name }}</h6>
                </div>

                <div v-if="candidate.slogan" class="alert alert-light border small text-muted fst-italic p-2 mb-3">
                  "{{ candidate.slogan }}"
                </div>

                <div class="mt-auto pt-2">
                  <button
                    class="btn btn-outline-primary w-100 rounded-3 d-flex align-items-center justify-content-center gap-1 py-2"
                    @click="openCandidateModal(candidate)"
                  >
                    <i class="bi bi-eye"></i>
                    <span>Lihat Visi & Misi</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Cara Memilih Section -->
    <section class="py-5 border-top border-bottom" style="background-color: #c2c3c0;">
      <div class="container">
        <div class="text-center mb-5">
          <h3 class="fw-bold text-dark">Tata Cara Pemilihan di eOSIS</h3>
          <p class="text-secondary small">Empat langkah mudah menyalurkan aspirasi Anda</p>
        </div>

        <div class="row g-4 text-center">
          <div class="col-sm-6 col-lg-3">
            <div class="p-4 rounded-4 bg-light h-100">
              <div class="stat-icon bg-primary text-white mx-auto mb-3">
                <i class="bi bi-box-arrow-in-right"></i>
              </div>
              <h6 class="fw-bold text-dark">1. Login Pemilih</h6>
              <p class="text-secondary small mb-0">Masukkan NISN dan Tanggal Lahir sesuai data yang terdaftar di sekolah.</p>
            </div>
          </div>

          <div class="col-sm-6 col-lg-3">
            <div class="p-4 rounded-4 bg-light h-100">
              <div class="stat-icon bg-info text-white mx-auto mb-3">
                <i class="bi bi-card-checklist"></i>
              </div>
              <h6 class="fw-bold text-dark">2. Verifikasi Hak Suara</h6>
              <p class="text-secondary small mb-0">Periksa biodata dan pastikan status hak suara Anda masih bertuliskan "Belum Memilih".</p>
            </div>
          </div>

          <div class="col-sm-6 col-lg-3">
            <div class="p-4 rounded-4 bg-light h-100">
              <div class="stat-icon bg-warning text-white mx-auto mb-3">
                <i class="bi bi-hand-index-thumb"></i>
              </div>
              <h6 class="fw-bold text-dark">3. Masuk Bilik & Pilih</h6>
              <p class="text-secondary small mb-0">Pelajari visi misi, tentukan pasangan calon terbaik, dan konfirmasi pilihan Anda.</p>
            </div>
          </div>

          <div class="col-sm-6 col-lg-3">
            <div class="p-4 rounded-4 bg-light h-100">
              <div class="stat-icon bg-success text-white mx-auto mb-3">
                <i class="bi bi-check2-all"></i>
              </div>
              <h6 class="fw-bold text-dark">4. Selesai</h6>
              <p class="text-secondary small mb-0">Suara Anda dienkripsi secara anonim dan otomatis keluar dari sistem dengan aman.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="mt-auto py-4 bg-dark text-white border-top">
      <div class="container text-center text-sm-start d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3">
        <div>
          <div class="fw-bold fs-6">eOSIS - Pemilihan Ketua OSIS Online</div>
          <div class="text-secondary small">{{ settings?.school_name }} • Periode {{ settings?.election_period }}</div>
        </div>
        <div class="text-secondary small">
          Aplikasi e-Voting LUBER JURDIL didukung Supabase & Vue 3
        </div>
      </div>
    </footer>

    <!-- Candidate Detail Modal -->
    <CandidateModal
      :candidate="selectedCandidate"
      :allow-vote="false"
      @close="selectedCandidate = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Navbar from '../components/Navbar.vue';
import CandidateModal from '../components/CandidateModal.vue';
import { supabaseService } from '../services/supabase';
import { authState } from '../services/auth';
import type { SchoolSettings, Candidate, DashboardStats } from '../types';

const settings = ref<SchoolSettings | null>(null);
const candidates = ref<Candidate[]>([]);
const stats = ref<DashboardStats>({
  totalStudents: 0,
  totalTeachers: 0,
  totalClasses: 0,
  totalCandidates: 0,
  votedStudents: 0,
  unvotedStudents: 0,
  participationRate: 0,
});
const selectedCandidate = ref<Candidate | null>(null);

const isStudentLoggedIn = authState.isStudentLoggedIn;
const isAdminLoggedIn = authState.isAdminLoggedIn;

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return dateStr;
  }
};

const openCandidateModal = (cand: Candidate) => {
  selectedCandidate.value = cand;
};

onMounted(async () => {
  settings.value = await supabaseService.getSettings();
  candidates.value = await supabaseService.getCandidates();
  stats.value = await supabaseService.getDashboardStats();
});
</script>
