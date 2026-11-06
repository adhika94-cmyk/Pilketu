import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { authState } from '../services/auth';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue'),
    meta: { title: 'eOSIS - Pemilihan Ketua OSIS Online' }
  },
  // Siswa / Pemilih Routes
  {
    path: '/siswa/login',
    name: 'StudentLogin',
    component: () => import('../views/student/StudentLoginView.vue'),
    meta: { title: 'Login Pemilih Siswa - eOSIS' }
  },
  {
    path: '/guru-staff/login',
    name: 'TeacherLogin',
    component: () => import('../views/teacher/TeacherLoginView.vue'),
    meta: { title: 'Login Pemilih Guru & Staff - eOSIS' }
  },
  {
    path: '/siswa/dashboard',
    name: 'StudentDashboard',
    component: () => import('../views/student/StudentDashboardView.vue'),
    meta: { requiresStudent: true, title: 'Hak Suara Pemilih - eOSIS' }
  },
  {
    path: '/siswa/bilik-suara',
    name: 'VoteBooth',
    component: () => import('../views/student/VoteBoothView.vue'),
    meta: { requiresStudent: true, requiresNotVoted: true, title: 'Bilik Suara - eOSIS' }
  },
  // Admin Routes
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: () => import('../views/admin/AdminLoginView.vue'),
    meta: { title: 'Login Admin - eOSIS' }
  },
  {
    path: '/admin/beranda',
    name: 'AdminDashboard',
    component: () => import('../views/admin/AdminDashboardView.vue'),
    meta: { requiresAdmin: true, title: 'Beranda Admin - eOSIS' }
  },
  {
    path: '/admin/kelas',
    name: 'AdminClasses',
    component: () => import('../views/admin/ClassesView.vue'),
    meta: { requiresAdmin: true, title: 'Manajemen Kelas - eOSIS' }
  },
  {
    path: '/admin/siswa',
    name: 'AdminStudents',
    component: () => import('../views/admin/StudentsView.vue'),
    meta: { requiresAdmin: true, title: 'Data Siswa & Hak Suara - eOSIS' }
  },
  {
    path: '/admin/kandidat',
    name: 'AdminCandidates',
    component: () => import('../views/admin/CandidatesView.vue'),
    meta: { requiresAdmin: true, title: 'Calon Kandidat - eOSIS' }
  },
  {
    path: '/admin/perolehan-suara',
    name: 'AdminVoteResults',
    component: () => import('../views/admin/VoteResultsView.vue'),
    meta: { requiresAdmin: true, title: 'Perolehan Suara - eOSIS' }
  },
  {
    path: '/admin/pengaturan',
    name: 'AdminSettings',
    component: () => import('../views/admin/SettingsView.vue'),
    meta: { requiresAdmin: true, title: 'Pengaturan Aplikasi - eOSIS' }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  }
});

router.beforeEach((to, _from, next) => {
  // Update page title
  if (to.meta.title) {
    document.title = to.meta.title as string;
  }

  // Admin guard
  if (to.meta.requiresAdmin && !authState.isAdminLoggedIn.value) {
    next({ name: 'AdminLogin', query: { redirect: to.fullPath } });
    return;
  }

  // Student guard
  if (to.meta.requiresStudent && !authState.isStudentLoggedIn.value) {
    next({ name: 'StudentLogin' });
    return;
  }

  // Student already voted guard
  if (to.meta.requiresNotVoted && authState.currentStudent.value?.has_voted) {
    next({ name: 'StudentDashboard' });
    return;
  }

  next();
});

export default router;
