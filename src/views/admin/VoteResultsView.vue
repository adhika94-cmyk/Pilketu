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
            <h4 class="fw-bold text-dark mb-0 fs-5">Perolehan Suara Pemilihan</h4>
            <span class="text-muted small">Penghitungan suara real-time secara transparan dan terenkripsi</span>
          </div>
        </div>

        <div class="d-flex align-items-center gap-2">
          <!-- Live Auto Refresh Toggle -->
          <button
            class="btn btn-sm rounded-3 d-flex align-items-center gap-1"
            :class="autoRefresh ? 'btn-success' : 'btn-outline-secondary'"
            @click="toggleAutoRefresh"
          >
            <i class="bi bi-broadcast"></i>
            <span>{{ autoRefresh ? 'Live Aktif (5s)' : 'Live Mati' }}</span>
          </button>

          <button class="btn btn-outline-secondary btn-sm rounded-3 d-flex align-items-center gap-1" @click="loadData">
            <i class="bi bi-arrow-clockwise"></i>
            <span>Segarkan</span>
          </button>

          <!-- Export Dropdown -->
          <div class="dropdown">
            <button
              class="btn btn-primary btn-sm rounded-3 dropdown-toggle d-flex align-items-center gap-1 shadow-sm"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i class="bi bi-download"></i>
              <span>Export Hasil</span>
            </button>
            <ul class="dropdown-menu dropdown-menu-end shadow border-0 rounded-3 small p-2" style="min-width: 240px;">
              <li>
                <button class="dropdown-item d-flex align-items-center gap-2 py-2 rounded-2" @click="exportToCSV">
                  <i class="bi bi-file-earmark-excel text-success fs-5"></i>
                  <div>
                    <div class="fw-semibold text-dark">Export Format CSV</div>
                    <div class="text-muted small" style="font-size: 0.72rem;">File spreadsheet / Excel data mentah</div>
                  </div>
                </button>
              </li>
              <li><hr class="dropdown-divider my-1"></li>
              <li>
                <button class="dropdown-item d-flex align-items-center gap-2 py-2 rounded-2" @click="exportToPDF">
                  <i class="bi bi-file-earmark-pdf text-danger fs-5"></i>
                  <div>
                    <div class="fw-semibold text-dark">Cetak / Export PDF</div>
                    <div class="text-muted small" style="font-size: 0.72rem;">Berita Acara Resmi siap cetak / simpan PDF</div>
                  </div>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </header>

      <!-- Content Area -->
      <main class="p-4 flex-grow-1" id="printableArea">
        <!-- Printable Official Document Header (Visible only when printing to PDF) -->
        <div class="print-only mb-4 border-bottom pb-3">
          <div class="text-center mb-3">
            <h3 class="fw-bold text-dark text-uppercase mb-1">BERITA ACARA REKAPITULASI PEROLEHAN SUARA</h3>
            <h4 class="fw-bold text-primary mb-1">{{ settings?.school_name || 'PEMILIHAN KETUA & WAKIL KETUA OSIS' }}</h4>
            <p class="text-secondary small mb-0">PERIODE KEPENGURUSAN {{ settings?.election_period || 'RESMI' }}</p>
          </div>
          <hr class="my-3" style="border-top: 2px dashed #666;" />
          <div class="row small">
            <div class="col-6">
              <div><strong>Waktu Cetak:</strong> {{ currentTimestamp }}</div>
              <div><strong>Total DPT Pemilih:</strong> {{ totalStudents }} Pemilih</div>
            </div>
            <div class="col-6 text-end">
              <div><strong>Total Suara Sah Masuk:</strong> {{ totalVotes }} Suara</div>
              <div><strong>Tingkat Partisipasi:</strong> {{ participationRate }}%</div>
            </div>
          </div>
        </div>

        <!-- Summary Stat Cards -->
        <div class="row g-3 mb-4">
          <div class="col-sm-6 col-lg-3">
            <div class="stat-card">
              <div class="stat-icon bg-primary-subtle text-primary">
                <i class="bi bi-inbox-fill"></i>
              </div>
              <div>
                <div class="text-muted small fw-medium">Total Suara Masuk</div>
                <div class="fs-3 fw-bold text-dark">{{ totalVotes }}</div>
                <div class="text-muted small" style="font-size: 0.72rem;">Suara sah tercatat</div>
              </div>
            </div>
          </div>

          <div class="col-sm-6 col-lg-3">
            <div class="stat-card">
              <div class="stat-icon bg-info-subtle text-info">
                <i class="bi bi-people-fill"></i>
              </div>
              <div>
                <div class="text-muted small fw-medium">Total DPT Siswa</div>
                <div class="fs-3 fw-bold text-dark">{{ totalStudents }}</div>
                <div class="text-muted small" style="font-size: 0.72rem;">Daftar pemilih tetap</div>
              </div>
            </div>
          </div>

          <div class="col-sm-6 col-lg-3">
            <div class="stat-card">
              <div class="stat-icon bg-success-subtle text-success">
                <i class="bi bi-graph-up-arrow"></i>
              </div>
              <div>
                <div class="text-muted small fw-medium">Partisipasi Pemilih</div>
                <div class="fs-3 fw-bold text-success">{{ participationRate }}%</div>
                <div class="text-muted small" style="font-size: 0.72rem;">Tingkat keikutsertaan</div>
              </div>
            </div>
          </div>

          <div class="col-sm-6 col-lg-3">
            <div class="stat-card">
              <div class="stat-icon bg-warning-subtle text-warning">
                <i class="bi bi-trophy-fill"></i>
              </div>
              <div>
                <div class="text-muted small fw-medium">Suara Terbanyak</div>
                <div class="fs-4 fw-bold text-warning-emphasis text-truncate" style="max-width: 140px;">
                  {{ leadingCandidate ? `No. ${leadingCandidate.order_number}` : '-' }}
                </div>
                <div class="text-muted small text-truncate" style="font-size: 0.72rem;">
                  {{ leadingCandidate ? leadingCandidate.leader_name : 'Belum ada suara' }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="row g-4 mb-4">
          <!-- Bar Chart -->
          <div class="col-lg-8">
            <div class="card-custom bg-white border p-4 rounded-4 shadow-sm h-100">
              <div class="d-flex align-items-center justify-content-between mb-3">
                <h5 class="fw-bold text-dark mb-0">Grafik Batang Perolehan Suara</h5>
                <span class="badge bg-light text-secondary border">Realtime Chart</span>
              </div>
              <div style="position: relative; height: 320px;">
                <canvas ref="barChartCanvas"></canvas>
              </div>
            </div>
          </div>

          <!-- Doughnut Chart -->
          <div class="col-lg-4">
            <div class="card-custom bg-white border p-4 rounded-4 shadow-sm h-100">
              <div class="d-flex align-items-center justify-content-between mb-3">
                <h5 class="fw-bold text-dark mb-0">Proporsi Suara (%)</h5>
                <span class="badge bg-light text-secondary border">Persentase</span>
              </div>
              <div style="position: relative; height: 320px;" class="d-flex align-items-center justify-content-center">
                <canvas ref="doughnutChartCanvas"></canvas>
              </div>
            </div>
          </div>
        </div>

        <!-- Detailed Table of Results -->
        <div class="card-custom bg-white border rounded-4 shadow-sm overflow-hidden mb-4">
          <div class="p-4 border-bottom bg-light d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <h5 class="fw-bold text-dark mb-0">Tabel Rekapitulasi Perolehan Suara</h5>
              <div class="text-muted small">Rincian suara per pasangan calon ketua dan wakil ketua OSIS</div>
            </div>
            <div class="d-flex align-items-center gap-2">
              <button class="btn btn-outline-success btn-sm rounded-3 d-flex align-items-center gap-1" @click="exportToCSV">
                <i class="bi bi-file-earmark-spreadsheet"></i>
                <span>Export CSV</span>
              </button>
              <button class="btn btn-outline-primary btn-sm rounded-3 d-flex align-items-center gap-1" @click="exportToPDF">
                <i class="bi bi-printer"></i>
                <span>Cetak / PDF</span>
              </button>
              <span class="badge bg-primary rounded-pill px-3 py-2 fs-6">
                Total {{ totalVotes }} Suara Masuk
              </span>
            </div>
          </div>

          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light text-secondary small">
                <tr>
                  <th style="width: 80px;" class="text-center">Nomor</th>
                  <th style="width: 80px;" class="no-print">Foto</th>
                  <th>Pasangan Calon</th>
                  <th>Slogan</th>
                  <th class="text-center" style="width: 140px;">Jumlah Suara</th>
                  <th style="width: 200px;">Persentase</th>
                  <th class="text-center" style="width: 120px;">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="cand in sortedCandidates" :key="cand.id">
                  <td class="text-center">
                    <span class="badge bg-primary fs-6 px-3 py-1.5 rounded-pill shadow-sm">
                      #{{ cand.order_number }}
                    </span>
                  </td>
                  <td class="no-print">
                    <img
                      :src="cand.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'"
                      :alt="'Paslon ' + cand.order_number"
                      class="rounded-3 object-fit-cover shadow-sm border"
                      style="width: 50px; height: 50px;"
                    />
                  </td>
                  <td>
                    <div class="fw-bold text-dark fs-6">{{ cand.leader_name }}</div>
                    <div class="text-muted small">& {{ cand.vice_leader_name }}</div>
                  </td>
                  <td>
                    <span class="text-secondary small fst-italic">{{ cand.slogan || '-' }}</span>
                  </td>
                  <td class="text-center">
                    <span class="fw-extrabold fs-5 text-dark">{{ cand.vote_count || 0 }}</span>
                    <span class="text-muted small d-block">suara</span>
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
                      v-if="cand.id === leadingCandidate?.id && (cand.vote_count || 0) > 0"
                      class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle rounded-pill px-2.5 py-1"
                    >
                      <i class="bi bi-star-fill text-warning me-1"></i> Terbanyak
                    </span>
                    <span v-else class="text-muted small">-</span>
                  </td>
                </tr>
                <tr v-if="candidates.length === 0">
                  <td colspan="7" class="text-center py-5 text-muted">
                    Belum ada calon kandidat yang terdaftar.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Print-only Signatures Section for Official PDF Record -->
        <div class="print-only mt-5 pt-4">
          <div class="row text-center small">
            <div class="col-6">
              <p class="mb-5">Mengetahui,<br><strong>Ketua Panitia Pemilihan OSIS</strong></p>
              <br><br>
              <p class="fw-bold mb-0">( ________________________ )</p>
            </div>
            <div class="col-6">
              <p class="mb-5">Disahkan Oleh,<br><strong>Pembina OSIS / Kepala Sekolah</strong></p>
              <br><br>
              <p class="fw-bold mb-0">( ________________________ )</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { Chart, registerables } from 'chart.js';
import AdminSidebar from '../../components/AdminSidebar.vue';
import { supabaseService } from '../../services/supabase';
import type { Candidate, SchoolSettings } from '../../types';

Chart.register(...registerables);

const sidebarOpen = ref(false);
const candidates = ref<Candidate[]>([]);
const settings = ref<SchoolSettings | null>(null);
const totalStudents = ref(0);
const totalVotes = ref(0);
const autoRefresh = ref(false);
let refreshTimer: any = null;

const barChartCanvas = ref<HTMLCanvasElement | null>(null);
const doughnutChartCanvas = ref<HTMLCanvasElement | null>(null);
let barChartInstance: Chart | null = null;
let doughnutChartInstance: Chart | null = null;

const currentTimestamp = computed(() => {
  return new Date().toLocaleString('id-ID', {
    dateStyle: 'full',
    timeStyle: 'medium',
  });
});

const participationRate = computed(() => {
  if (totalStudents.value === 0) return 0;
  return Number(((totalVotes.value / totalStudents.value) * 100).toFixed(1));
});

const sortedCandidates = computed(() => {
  return [...candidates.value].sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0));
});

const leadingCandidate = computed(() => {
  if (sortedCandidates.value.length === 0) return null;
  const top = sortedCandidates.value[0];
  return (top.vote_count || 0) > 0 ? top : null;
});

const loadData = async () => {
  const [cands, stats, votes, sets] = await Promise.all([
    supabaseService.getCandidates(),
    supabaseService.getDashboardStats(),
    supabaseService.getVotes(),
    supabaseService.getSettings(),
  ]);

  candidates.value = cands;
  totalStudents.value = stats.totalStudents;
  totalVotes.value = votes.length;
  settings.value = sets;

  await nextTick();
  renderCharts();
};

const renderCharts = () => {
  const labels = candidates.value.map(c => `No. ${c.order_number} (${c.leader_name.split(' ')[0]})`);
  const data = candidates.value.map(c => c.vote_count || 0);

  const colors = [
    '#2563eb', // Blue
    '#0ea5e9', // Sky
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#8b5cf6', // Violet
    '#ec4899', // Pink
  ];

  // 1. Render Bar Chart
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
          data,
          backgroundColor: colors.slice(0, candidates.value.length),
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

  // 2. Render Doughnut Chart
  if (doughnutChartCanvas.value) {
    if (doughnutChartInstance) {
      doughnutChartInstance.destroy();
    }
    doughnutChartInstance = new Chart(doughnutChartCanvas.value, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: totalVotes.value > 0 ? data : [1],
          backgroundColor: totalVotes.value > 0 ? colors.slice(0, candidates.value.length) : ['#e2e8f0'],
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
            enabled: totalVotes.value > 0,
            callbacks: {
              label: (ctx) => {
                const val = ctx.parsed;
                const pct = totalVotes.value > 0 ? ((val / totalVotes.value) * 100).toFixed(1) : 0;
                return ` ${val} Suara (${pct}%)`;
              }
            }
          }
        },
        cutout: '68%'
      }
    });
  }
};

const toggleAutoRefresh = () => {
  autoRefresh.value = !autoRefresh.value;
  if (autoRefresh.value) {
    refreshTimer = setInterval(() => {
      loadData();
    }, 5000);
  } else if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
};

// Fitur Export CSV
const exportToCSV = () => {
  if (candidates.value.length === 0) {
    alert('Belum ada data perolehan suara untuk diexport.');
    return;
  }

  const schoolName = settings.value?.school_name || 'eOSIS';
  const period = settings.value?.election_period || '-';
  const exportDate = new Date().toLocaleString('id-ID');

  let csv = '\uFEFF'; // UTF-8 BOM agar rapi di Microsoft Excel

  // Header & Informasi Laporan
  csv += `"BERITA ACARA & LAPORAN REKAPITULASI PEROLEHAN SUARA eOSIS"\n`;
  csv += `"Sekolah","${schoolName.replace(/"/g, '""')}"\n`;
  csv += `"Periode Pemilihan","${period.replace(/"/g, '""')}"\n`;
  csv += `"Waktu Export","${exportDate}"\n`;
  csv += `"Total DPT Pemilih","${totalStudents.value}"\n`;
  csv += `"Total Suara Masuk","${totalVotes.value}"\n`;
  csv += `"Tingkat Partisipasi","${participationRate.value}%"\n\n`;

  // Kolom Data
  csv += `"Peringkat","Nomor Urut","Calon Ketua","Calon Wakil","Slogan","Jumlah Suara Sah","Persentase (%)"\n`;

  sortedCandidates.value.forEach((cand, index) => {
    const leader = (cand.leader_name || '').replace(/"/g, '""');
    const vice = (cand.vice_leader_name || '').replace(/"/g, '""');
    const slogan = (cand.slogan || '-').replace(/"/g, '""');
    const votes = cand.vote_count || 0;
    const pct = cand.percentage || 0;

    csv += `"${index + 1}","${cand.order_number}","${leader}","${vice}","${slogan}","${votes}","${pct}%"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const safePeriod = period.replace(/[^a-zA-Z0-9]/g, '_');
  link.setAttribute('download', `Perolehan_Suara_eOSIS_${safePeriod}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Fitur Export PDF / Print Laporan Resmi
const exportToPDF = () => {
  window.print();
};

onMounted(() => {
  loadData();
});

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
  }
  if (barChartInstance) barChartInstance.destroy();
  if (doughnutChartInstance) doughnutChartInstance.destroy();
});
</script>

<style>
.print-only {
  display: none;
}

@media print {
  @page {
    size: A4 portrait;
    margin: 1.5cm;
  }
  body {
    background: #fff !important;
    color: #000 !important;
  }
  .admin-sidebar,
  .admin-topbar,
  .btn,
  .dropdown,
  .no-print,
  .badge.animate-pulse {
    display: none !important;
  }
  .print-only {
    display: block !important;
  }
  .admin-content {
    margin-left: 0 !important;
    padding: 0 !important;
  }
  .card-custom {
    border: none !important;
    box-shadow: none !important;
    padding: 0 !important;
  }
  .table {
    border-color: #dee2e6 !important;
  }
}
</style>
