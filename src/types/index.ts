export interface SchoolSettings {
  id?: string;
  school_name: string;
  school_logo: string;
  election_period: string; // e.g., '2026/2027'
  start_date: string;
  end_date: string;
  is_active: boolean;
  announcement?: string;
  updated_at?: string;
}

export interface ClassItem {
  id: string;
  name: string; // e.g. 'X MIPA 1', 'XI IPS 2'
  grade: string; // 'X', 'XI', 'XII'
  major: string; // 'MIPA', 'IPS', 'Teknik', etc.
  created_at?: string;
}

export type VoterType = 'SISWA' | 'GURU' | 'STAFF';

export interface Student {
  id: string;
  nisn: string; // NISN untuk Siswa, NIP / NUPTK / ID Pegawai untuk Guru & Staff
  name: string;
  birth_date: string; // YYYY-MM-DD
  gender: 'L' | 'P';
  class_id: string;
  class_name?: string;
  voter_type?: VoterType; // Default 'SISWA'
  has_voted: boolean;
  voted_at?: string | null;
  created_at?: string;
}

export type Voter = Student;

export interface Candidate {
  id: string;
  order_number: number; // Nomor urut
  leader_name: string;
  vice_leader_name: string;
  slogan: string;
  vision: string;
  mission: string[]; // List of missions
  photo_url: string;
  vote_count?: number;
  percentage?: number;
  created_at?: string;
}

export interface VoteRecord {
  id?: string;
  candidate_id: string;
  created_at?: string;
}

export interface AdminUser {
  id: string;
  username: string;
  name: string;
  email?: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalCandidates: number;
  votedStudents: number;
  unvotedStudents: number;
  participationRate: number;
}
