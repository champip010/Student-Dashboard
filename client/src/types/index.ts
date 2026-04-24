export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT';
export type StudentStatus = 'ACTIVE' | 'INACTIVE' | 'GRADUATED';
export type ClassStatus = 'ACTIVE' | 'ARCHIVED';
export type AssignmentStatus = 'PENDING' | 'SUBMITTED' | 'LATE' | 'MISSING';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
  teacherProfile?: Teacher;
  studentProfile?: Student;
}

export interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  userId: string;
}

export interface Student {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  phone?: string;
  address?: string;
  photoUrl?: string;
  enrollmentDate: string;
  graduationYear?: number;
  status: StudentStatus;
  enrollments?: Enrollment[];
  submissions?: Submission[];
  testScores?: TestScore[];
  researchProgress?: ResearchProgress;
}

export interface ResearchProgress {
  id: string;
  studentId: string;
  student?: Student;
  stage: string;
  status: string;
  remarks?: string;
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
}

export interface Class {
  id: string;
  code: string;
  name: string;
  subject: string;
  description?: string;
  room?: string;
  schedule?: string;
  status: ClassStatus;
  teacherId: string;
  teacher?: Teacher;
  enrollments?: Enrollment[];
  assignments?: Assignment[];
  tests?: Test[];
}

export interface Enrollment {
  id: string;
  studentId: string;
  classId: string;
  enrolledAt: string;
  student?: Student;
  class?: Class;
}

export interface Assignment {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  maxScore: number;
  attachments: string[];
  classId: string;
  teacherId: string;
  class?: Class;
  teacher?: Teacher;
  submissions?: Submission[];
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  fileUrl?: string;
  score?: number;
  status: AssignmentStatus;
  submittedAt?: string;
  gradedAt?: string;
  student?: Student;
  assignment?: Assignment;
}

export interface Test {
  id: string;
  title: string;
  date: string;
  duration: number;
  totalMarks: number;
  syllabus?: string;
  classId: string;
  teacherId: string;
  class?: Class;
  teacher?: Teacher;
  scores?: TestScore[];
}

export interface TestScore {
  id: string;
  testId: string;
  studentId: string;
  marks: number;
  percentage: number;
  gradedAt: string;
  student?: Student;
  test?: Test;
}

export interface ActivityLog {
  id: string;
  action: string;
  details?: string;
  userId?: string;
  teacherId?: string;
  studentId?: string;
  createdAt: string;
  user?: User;
  teacher?: Teacher;
  student?: Student;
}

export interface DashboardData {
  kpis: {
    totalStudents: number;
    activeClasses: number;
    pendingAssignments: number;
    upcomingTests: number;
  };
  recentActivity: ActivityLog[];
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}