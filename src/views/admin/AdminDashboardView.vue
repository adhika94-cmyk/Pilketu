<template>
  <div class="d-flex min-vh-100">
    <!-- Sidebar -->
    <AdminSidebar :is-open="sidebarOpen" @close="sidebarOpen = false" />

    <!-- Main Content -->
    <div class="admin-content flex-grow-1">
      <!-- Topbar -->
      <header class="admin-topbar d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center gap-3">
          <button class="btn btn-light d-lg-none border" @click="sidebarOpen = !sidebarOpen">
            <i class="bi bi-list fs-5"></i>
          </button>
          <div>
            <h4 class="fw-bold text-dark mb-0 fs-5">Beranda Admin</h4>
            <span class="text-muted small">Dashboard statistik & perolehan suara eOSIS</span>
          </div>
        </div>

        <div class="d-flex align-items-center gap-2">
          <ThemeToggle />
          <button
            class="btn btn-outline-secondary btn-sm rounded-3 d-flex align-items-center gap-1"
            @click="refreshData"
          >
            <i class="bi bi-arrow-clockwise" :class="{ 'spin': isRefreshing }"></i>
            <span class="d-none d-sm-inline">Muat Ulang</span>
          </button>
          <router-link
            to="/admin/perolehan-suara"
            class="btn btn-primary btn-sm rounded-3 d-flex align-items-center gap-1 shadow-sm"
          >
            <i class="bi bi-bar-chart-fill"></i>
            <span>Detail Perolehan Suara</span>
          </router-link>
          <button
            class="btn btn-outline-danger btn-sm rounded-3 d-flex align-items-center gap-1"
            title="Keluar dari Panel Admin"
            @click="handleLogout"
          >
            <i class="bi bi-box-arrow-right"></i>
            <span class="d-none d-sm-inline">Keluar</span>
          </button>
        </div>
      </header>

      <!-- Content Area -->
      <main class="p-3 p-md-4 flex-grow-1">
        <!-- School Banner & Status -->
        <div class="card-custom p-4 bg-white border mb-4 rounded-4 shadow-sm position-relative overflow-hidden">
          <div class="row align-items-center g-3">
            <div class="col-md-8">
              <div class="d-flex align-items-center flex-wrap gap-2 mb-2">
                <span class="badge bg-primary-subtle text-primary fw-semibold px-3 py-1 rounded-pill">
                  Periode {{ settings?.election_period || '-' }}
                </span>
                <span
                  v-if="settings?.is_active"
                  class="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1 rounded-pill"
                >
                  <i class="bi bi-circle-fill me-1" style="font-size: 0.5rem;"></i> Pemilihan Buka
                </span>
                <span
                  v-else
                  class="badge bg-secondary-subtle text-secondary border px-2.5 py-1 rounded-pill"
                >
                  <i class="bi bi-lock-fill me-1"></i> Pemilihan Ditutup
                </span>
              </div>
              <h3 class="fw-extrabold text-dark mb-1">{{ settings?.school_name || 'eOSIS' }}</h3>
              <p class="text-secondary small mb-0">
                {{ settings?.announcement || 'Portal Resmi Pemilihan Ketua & Wakil Ketua OSIS' }}
              </p>
            </div>
            <div class="col-md-4 text-md-end">
              <button
                class="btn btn-sm rounded-3 fw-semibold px-3 py-2"
                :class="settings?.is_active ? 'btn-outline-danger' : 'btn-outline-success'"
                @click="toggleElectionStatus"
              >
                <i :class="settings?.is_active ? 'bi bi-pause-circle me-1' : 'bi bi-play-circle me-1'"></i>
                {{ settings?.is_active ? 'Tutup Pemilihan' : 'Buka Pemilihan' }}
              </button>
            </div>
          </div>
        </div>

        <!-- 6 Main Statistics Cards -->
        <div class="row g-3 mb-4">
          <!-- Total Siswa -->
          <div class="col-12 col-sm-6 col-xl-4">
            <div class="stat-card">
              <div class="stat-icon bg-primary-subtle text-primary">
                <i class="bi bi-people-fill"></i>
              </div>
              <div class="flex-grow-1 overflow-hidden">
                <div class="text-muted small fw-medium text-truncate">Total Siswa</div>
                <div class="fs-3 fw-bold text-dark d-flex align-items-baseline gap-2">
                  <span>{{ stats.totalStudents }}</span>
                  <span v-if="stats.totalTeachers > 0" class="badge bg-success-subtle text-success fw-normal" style="font-size: 0.72rem;">
                    +{{ stats.totalTeachers }} Guru/Staff
                  </span>
                </div>
                <div class="text-muted small" style="font-size: 0.75rem;">Total {{ stats.totalStudents + (stats.totalTeachers || 0) }} DPT</div>
              </div>
            </div>
          </div>

          <!-- Total Kelas -->
          <div class="col-12 col-sm-6 col-xl-4">
            <div class="stat-card">
              <div class="stat-icon bg-info-subtle text-info">
                <i class="bi bi-diagram-3-fill"></i>
              </div>
              <div class="flex-grow-1 overflow-hidden">
                <div class="text-muted small fw-medium text-truncate">Total Kelas</div>
                <div class="fs-3 fw-bold text-dark">{{ stats.totalClasses }}</div>
                <div class="text-muted small" style="font-size: 0.75rem;">Kelas Terdaftar</div>
              </div>
            </div>
          </div>

          <!-- Total Kandidat -->
          <div class="col-12 col-sm-6 col-xl-4">
            <div class="stat-card">
              <div class="stat-icon bg-warning-subtle text-warning">
                <i class="bi bi-person-badge-fill"></i>
              </div>
              <div class="flex-grow-1 overflow-hidden">
                <div class="text-muted small fw-medium text-truncate">Total Kandidat</div>
                <div class="fs-3 fw-bold text-dark">{{ stats.totalCandidates }}</div>
                <div class="text-muted small" style="font-size: 0.75rem;">Pasangan Calon</div>
              </div>
            </div>
          </div>

          <!-- Sudah Memilih -->
          <div class="col-12 col-sm-6 col-xl-4">
            <div class="stat-card">
              <div class="stat-icon bg-success-subtle text-success">
                <i class="bi bi-check2-circle"></i>
              </div>
              <div class="flex-grow-1 overflow-hidden">
                <div class="text-muted small fw-medium text-truncate">Sudah Memilih</div>
                <div class="fs-3 fw-bold text-success">{{ stats.votedStudents }}</div>
                <div class="text-success small" style="font-size: 0.75rem;">Suara Telah Masuk</div>
              </div>
            </div>
          </div>

          <!-- Belum Memilih -->
          <div class="col-12 col-sm-6 col-xl-4">
            <div class="stat-card">
              <div class="stat-icon bg-danger-subtle text-danger">
                <i class="bi bi-hourglass-split"></i>
              </div>
              <div class="flex-grow-1 overflow-hidden">
                <div class="text-muted small fw-medium text-truncate">Belum Memilih</div>
                <div class="fs-3 fw-bold text-danger">{{ stats.unvotedStudents }}</div>
                <div class="text-muted small" style="font-size: 0.75rem;">Menunggu Hak Suara</div>
              </div>
            </div>
          </div>

          <!-- Persentase Partisipasi -->
          <div class="col-12 col-sm-6 col-xl-4">
            <div class="stat-card">
              <div class="stat-icon bg-purple-subtle text-primary" style="background-color: #f3e8ff; color: #7e22ce;">
                <i class="bi bi-pie-chart-fill"></i>
              </div>
              <div class="flex-grow-1 overflow-hidden">
                <div class="text-muted small fw-medium text-truncate">Persentase Partisipasi</div>
                <div class="fs-3 fw-bold text-dark">{{ stats.participationRate }}%</div>
                <div class="progress mt-1" style="height: 6px;">
                  <div
                    class="progress-bar bg-success"
                    role="progressbar"
                    :style="{ width: stats.participationRate + '%' }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts Section (Chart.js) -->
        <div class="row g-4 mb-4">
          <!-- Candidate Votes Bar Chart -->
          <div class="col-12 col-lg-7 col-xl-8">
            <div class="card-custom bg-white border p-4 rounded-4 shadow-sm h-100">
              <div class="d-flex align-items-center justify-content-between mb-3">
                <div>
                  <h5 class="fw-bold text-dark mb-0">Grafik Perolehan Suara</h5>
                  <span class="text-muted small">Jumlah suara masuk per kandidat (urut terbanyak)</span>
                </div>
                <span class="badge bg-primary-subtle text-primary rounded-pill px-2.5 py-1 small">
                  Chart.js Bar
                </span>
              </div>
              <div style="position: relative; min-height: 280px; height: 300px;">
                <canvas ref="barChartCanvas"></canvas>
              </div>
            </div>
          </div>

          <!-- Participation Doughnut Chart -->
          <div class="col-12 col-lg-5 col-xl-4">
            <div class="card-custom bg-white border p-4 rounded-4 shadow-sm h-100">
              <div class="d-flex align-items-center justify-content-between mb-3">
                <div>
                  <h5 class="fw-bold text-dark mb-0">Grafik Partisipasi</h5>
                  <span class="text-muted small">Sudah vs Belum Memilih</span>
                </div>
                <span class="badge bg-success-subtle text-success rounded-pill px-2.5 py-1 small">
                  {{ stats.participationRate }}%
                </span>
              </div>
              <div style="position: relative; min-height: 280px; height: 300px;" class="d-flex align-items-center justify-content-center">
                <canvas ref="participationChartCanvas"></canvas>
              </div>
            </div>
          </div>
        </div>

        <!-- Sorted Candidate Votes Table -->
        <div class="card-custom bg-white border rounded-4 shadow-sm overflow-hidden mb-4">
          <div class="p-4 border-bottom bg-light d-flex flex-wrap align-items-center justify-content-between gap-2">
            <div>
              <h5 class="fw-bold text-dark mb-0">Tabel Perolehan Suara Sementara</h5>
              <div class="text-muted small">Diurutkan berdasarkan jumlah suara terbanyak</div>
            </div>
            <div class="d-flex align-items-center gap-2">
              <span class="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3 py-1.5 fw-semibold">
                Total {{ totalVotesCount }} Suara Sah
              </span>
            </div>
          </div>

          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light text-secondary small">
                <tr>
                  <th style="width: 70px;" class="text-center">Peringkat</th>
                  <th style="width: 80px;" class="text-center">No. Urut</th>
                  <th style="width: 70px;">Foto</th>
                  <th>Pasangan Calon</th>
                  <th>Slogan / Visi</th>
                  <th class="text-center" style="width: 130px;">Jumlah Suara</th>
                  <th style="width: 200px;">Persentase</th>
                  <th class="text-center" style="width: 130px;">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(cand, index) in sortedCandidates" :key="cand.id">
                  <td class="text-center fw-bold text-secondary">
                    <span
                      class="d-inline-flex align-items-center justify-content-center rounded-circle text-white fw-bold"
                      :class="{
                        'bg-warning': index === 0 && (cand.vote_count || 0) > 0,
                        'bg-secondary bg-opacity-75': index === 1 && (cand.vote_count || 0) > 0,
                        'bg-bronze': index === 2 && (cand.vote_count || 0) > 0,
                        'bg-light text-dark border': index > 2 || (cand.vote_count || 0) === 0
                      }"
                      style="width: 30px; height: 30px; font-size: 0.85rem;"
                    >
                      {{ index + 1 }}
                    </span>
                  </td>
                  <td class="text-center">
                    <span class="badge bg-primary fs-6 px-2.5 py-1 rounded-pill">
                      #{{ cand.order_number }}
                    </span>
                  </td>
                  <td>
                    <img
                      :src="cand.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'"
                      :alt="'Paslon ' + cand.order_number"
                      class="rounded-3 object-fit-cover shadow-sm border"
                      style="width: 46px; height: 46px;"
                    />
                  </td>
                  <td>
                    <div class="fw-bold text-dark fs-6">{{ cand.leader_name }}</div>
                    <div class="text-muted small">& {{ cand.vice_leader_name }}</div>
                  </td>
                  <td>
                    <span class="text-secondary small fst-italic text-truncate d-inline-block" style="max-width: 250px;">
                      {{ cand.slogan || cand.vision || '-' }}
                    </span>
                  </td>
                  <td class="text-center">
                    <span class="fw-extrabold fs-5 text-dark">{{ cand.vote_count || 0 }}</span>
                    <span class="text-muted small d-block" style="font-size: 0.72rem;">suara</span>
                  </td>
                  <td>
                    <div class="d-flex align-items-center gap-2">
                      <div class="progress flex-grow-1" style="height: 10px; border-radius: 999px;">
                        <div
                          class="progress-bar bg-primary progress-bar-striped"
                          :style="{ width: (cand.percentage || 0) + '%' }"
                        ></div>
                      </div>
                      <span class="fw-bold text-dark small" style="min-width: 45px;">{{ cand.percentage || 0 }}%</span>
                    </div>
                  </td>
                  <td class="text-center">
                    <span
                      v-if="index === 0 && (cand.vote_count || 0) > 0"
                      class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle rounded-pill px-2.5 py-1"
                    >
                      <i class="bi bi-trophy-fill text-warning me-1"></i> Suara Terbanyak
                    </span>
                    <span v-else-if="(cand.vote_count || 0) > 0" class="badge bg-light text-secondary border rounded-pill px-2 py-1 small">
                      Kandidat
                    </span>
                    <span v-else class="text-muted small">-</span>
                  </td>
                </tr>
                <tr v-if="candidates.length === 0">
                  <td colspan="8" class="text-center py-5 text-muted">
                    <i class="bi bi-inbox fs-3 d-block mb-2 text-muted"></i>
                    Belum ada calon kandidat yang terdaftar.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Quick Links / Navigation Cards -->
        <div class="row g-3">
          <div class="col-sm-6 col-md-3">
            <router-link to="/admin/siswa" class="card-custom bg-white border p-3 rounded-4 shadow-sm text-decoration-none d-flex align-items-center gap-3 h-100 hover-lift">
              <div class="p-3 bg-primary-subtle text-primary rounded-3">
                <i class="bi bi-people fs-4"></i>
              </div>
              <div>
                <div class="fw-bold text-dark mb-0">Kelola Siswa</div>
                <div class="text-muted small" style="font-size: 0.75rem;">NISN & DPT</div>
              </div>
            </router-link>
          </div>

          <div class="col-sm-6 col-md-3">
            <router-link to="/admin/kandidat" class="card-custom bg-white border p-3 rounded-4 shadow-sm text-decoration-none d-flex align-items-center gap-3 h-100 hover-lift">
              <div class="p-3 bg-warning-subtle text-warning rounded-3">
                <i class="bi bi-person-badge fs-4"></i>
              </div>
              <div>
                <div class="fw-bold text-dark mb-0">Kelola Kandidat</div>
                <div class="text-muted small" style="font-size: 0.75rem;">Paslon & Visi Misi</div>
              </div>
            </router-link>
          </div>

          <div class="col-sm-6 col-md-3">
            <router-link to="/admin/kelas" class="card-custom bg-white border p-3 rounded-4 shadow-sm text-decoration-none d-flex align-items-center gap-3 h-100 hover-lift">
              <div class="p-3 bg-info-subtle text-info rounded-3">
                <i class="bi bi-diagram-3 fs-4"></i>
              </div>
              <div>
                <div class="fw-bold text-dark mb-0">Kelola Kelas</div>
                <div class="text-muted small" style="font-size: 0.75rem;">Daftar Rombel</div>
              </div>
            </router-link>
          </div>

          <div class="col-sm-6 col-md-3">
            <router-link to="/admin/pengaturan" class="card-custom bg-white border p-3 rounded-4 shadow-sm text-decoration-none d-flex align-items-center gap-3 h-100 hover-lift">
              <div class="p-3 bg-success-subtle text-success rounded-3">
                <i class="bi bi-gear fs-4"></i>
              </div>
              <div>
                <div class="fw-bold text-dark mb-0">Pengaturan</div>
                <div class="text-muted small" style="font-size: 0.75rem;">Sekolah & Periode</div>
              </div>
            </router-link>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { Chart, registerables } from 'chart.js';
import AdminSidebar from '../../components/AdminSidebar.vue';
import ThemeToggle from '../../components/ThemeToggle.vue';
import { authState } from '../../services/auth';
import { supabaseService } from '../../services/supabase';
import type { SchoolSettings, Candidate, DashboardStats } from '../../types';

Chart.register(...registerables);

const router = useRouter();
const sidebarOpen = ref(false);

const handleLogout = () => {
  if (confirm('Apakah Anda yakin ingin keluar dari panel admin eOSIS?')) {
    authState.logoutAdmin();
    router.replace('/admin/login');
  }
};
const isRefreshing = ref(false);
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

const barChartCanvas = ref<HTMLCanvasElement | null>(null);
const participationChartCanvas = ref<HTMLCanvasElement | null>(null);
let barChartInstance: Chart | null = null;
let participationChartInstance: Chart | null = null;

const sortedCandidates = computed(() => {
  return [...candidates.value].sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0));
});

const totalVotesCount = computed(() => {
  return candidates.value.reduce((sum, c) => sum + (c.vote_count || 0), 0);
});

const loadDashboardData = async () => {
  const [sets, cands, statsData] = await Promise.all([
    supabaseService.getSettings(),
    supabaseService.getCandidates(),
    supabaseService.getDashboardStats(),
  ]);

  settings.value = sets;
  candidates.value = cands;
  stats.value = statsData;

  await nextTick();
  renderCharts();
};

const refreshData = async () => {
  isRefreshing.value = true;
  await loadDashboardData();
  setTimeout(() => {
    isRefreshing.value = false;
  }, 500);
};

const renderCharts = () => {
  const candidateData = sortedCandidates.value;
  const labels = candidateData.map(c => `No. ${c.order_number} (${c.leader_name.split(' ')[0]})`);
  const voteCounts = candidateData.map(c => c.vote_count || 0);

  const colors = [
    '#2563eb', // Primary Blue
    '#0ea5e9', // Sky Blue
    '#10b981', // Emerald Green
    '#f59e0b', // Amber Orange
    '#8b5cf6', // Violet Purple
    '#ec4899', // Pink
  ];

  // 1. Render Bar Chart for Votes
  if (barChartCanvas.value) {
    if (barChartInstance) {
      barChartInstance.destroy();
    }
    barChartInstance = new Chart(barChartCanvas.value, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Jumlah Suara',
          data: voteCounts,
          backgroundColor: colors.slice(0, candidateData.length),
          borderRadius: 8,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.parsed.y} Suara`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              precision: 0,
            },
            grid: {
              color: '#f1f5f9'
            }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });
  }

  // 2. Render Doughnut Chart for Participation
  if (participationChartCanvas.value) {
    if (participationChartInstance) {
      participationChartInstance.destroy();
    }

    const hasVotes = stats.value.votedStudents > 0 || stats.value.unvotedStudents > 0;
    const chartData = hasVotes
      ? [stats.value.votedStudents, stats.value.unvotedStudents]
      : [0, 1];
    const chartColors = hasVotes
      ? ['#10b981', '#ef4444'] // Green for Voted, Red for Unvoted
      : ['#e2e8f0', '#cbd5e1'];

    participationChartInstance = new Chart(participationChartCanvas.value, {
      type: 'doughnut',
      data: {
        labels: ['Sudah Memilih', 'Belum Memilih'],
        datasets: [{
          data: chartData,
          backgroundColor: chartColors,
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 12,
              padding: 14,
              font: { size: 12 }
            }
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const val = ctx.parsed;
                const total = stats.value.totalStudents || (stats.value.votedStudents + stats.value.unvotedStudents);
                const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
                return ` ${ctx.label}: ${val} (${pct}%)`;
              }
            }
          }
        },
        cutout: '70%'
      }
    });
  }
};

const toggleElectionStatus = async () => {
  if (!settings.value) return;
  const newStatus = !settings.value.is_active;
  const actionText = newStatus ? 'membuka' : 'menutup sementara';
  if (confirm(`Apakah Anda yakin ingin ${actionText} pemilihan OSIS?`)) {
    settings.value = await supabaseService.updateSettings({ is_active: newStatus });
  }
};

onMounted(() => {
  loadDashboardData();
});

onUnmounted(() => {
  if (barChartInstance) barChartInstance.destroy();
  if (participationChartInstance) participationChartInstance.destroy();
});
</script>

<style scoped>
.spin {
  animation: rotate 0.8s linear infinite;
}
@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}
.bg-bronze {
  background-color: #d97706 !important;
}
.hover-lift {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.08) !important;
}
</style>
