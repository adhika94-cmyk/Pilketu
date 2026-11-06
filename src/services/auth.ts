import { ref, computed } from 'vue';
import type { Student, AdminUser } from '../types';
import { supabaseService } from './supabase';

const ADMIN_SESSION_KEY = 'eosis_admin_session';
const STUDENT_SESSION_KEY = 'eosis_student_session';

// Admin state
const adminUser = ref<AdminUser | null>(
  sessionStorage.getItem(ADMIN_SESSION_KEY)
    ? JSON.parse(sessionStorage.getItem(ADMIN_SESSION_KEY)!)
    : null
);

// Student state
const currentStudent = ref<Student | null>(
  sessionStorage.getItem(STUDENT_SESSION_KEY)
    ? JSON.parse(sessionStorage.getItem(STUDENT_SESSION_KEY)!)
    : null
);

export const authState = {
  // Admin
  adminUser,
  isAdminLoggedIn: computed(() => !!adminUser.value),

  async loginAdmin(username: string, passwordPlain: string): Promise<boolean> {
    const valid = await supabaseService.verifyAdmin(username, passwordPlain);
    if (valid) {
      const profile = supabaseService.getAdminProfile();
      const user: AdminUser = {
        id: 'admin-1',
        username,
        name: profile.name || 'Administrator OSIS',
      };
      adminUser.value = user;
      sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(user));
      return true;
    }
    return false;
  },

  logoutAdmin() {
    adminUser.value = null;
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
  },

  // Student
  currentStudent,
  isStudentLoggedIn: computed(() => !!currentStudent.value),

  async loginStudent(nisn: string, birthDate: string): Promise<{ success: boolean; message?: string; student?: Student }> {
    const student = await supabaseService.findStudentForLogin(nisn, birthDate);
    if (!student) {
      return {
        success: false,
        message: 'NISN atau Tanggal Lahir tidak cocok dengan data pemilih.',
      };
    }

    currentStudent.value = student;
    sessionStorage.setItem(STUDENT_SESSION_KEY, JSON.stringify(student));
    return { success: true, student };
  },

  logoutStudent() {
    currentStudent.value = null;
    sessionStorage.removeItem(STUDENT_SESSION_KEY);
  },

  updateStudentLocalVoteStatus() {
    if (currentStudent.value) {
      currentStudent.value.has_voted = true;
      currentStudent.value.voted_at = new Date().toISOString();
      sessionStorage.setItem(STUDENT_SESSION_KEY, JSON.stringify(currentStudent.value));
    }
  }
};
