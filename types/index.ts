// types/index.ts

export type UserRole = "admin" | "student";

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  student_id?: number;
  matric_no?: string;
  department?: string;
  current_level?: number;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export interface Course {
  id: number;
  course_code: string;
  course_title: string;
  unit_counts: number;
}

export interface ResultRecord {
  id: number;
  student_id: number;
  course_id: number;
  ca_score: number;
  exam_score: number;
  total_score: number;
  letter_grade: string;
  grade_point: number;
  semester: string;
  academic_year: string;
  course_code: string;
  course_title: string;
  unit_counts: number;
}

export interface TermSummary {
  courses: ResultRecord[];
  totalUnits: number;
  weightedPoints: number;
  gpa: string;
}

export interface ReportCardResponse {
  student_id: string;
  cgpa: string;
  academic_records: {
    [semesterKey: string]: TermSummary;
  };
}
