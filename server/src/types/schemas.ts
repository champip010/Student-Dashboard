import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'TEACHER', 'STUDENT']),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

export const createStudentSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dateOfBirth: z.string().transform((str) => new Date(str)),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
  enrollmentDate: z.string().transform((str) => new Date(str)).optional(),
  graduationYear: z.number().int().min(2020).max(2040).optional(),
});

export const updateStudentSchema = createStudentSchema.partial();

export const createClassSchema = z.object({
  code: z.string().min(2).max(10),
  name: z.string().min(1),
  subject: z.string().min(1),
  description: z.string().optional(),
  room: z.string().optional(),
  schedule: z.string().optional(),
  teacherId: z.string().uuid(),
});

export const updateClassSchema = createClassSchema.partial().omit({ teacherId: true });

export const createAssignmentSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  dueDate: z.string().transform((str) => new Date(str)),
  maxScore: z.number().int().positive(),
  attachments: z.array(z.string()).optional(),
  classId: z.string().uuid(),
});

export const createSubmissionSchema = z.object({
  assignmentId: z.string().uuid(),
  fileUrl: z.string().optional(),
});

export const gradeSubmissionSchema = z.object({
  score: z.number().int().min(0),
});

export const createTestSchema = z.object({
  title: z.string().min(1),
  date: z.string().transform((str) => new Date(str)),
  duration: z.number().int().positive(),
  totalMarks: z.number().int().positive(),
  syllabus: z.string().optional(),
  classId: z.string().uuid(),
});

export const gradeTestSchema = z.object({
  studentId: z.string().uuid(),
  marks: z.number().int().min(0),
});

export const enrollStudentSchema = z.object({
  studentId: z.string().uuid(),
  classId: z.string().uuid(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
export type CreateClassInput = z.infer<typeof createClassSchema>;
export type UpdateClassInput = z.infer<typeof updateClassSchema>;
export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;
export type CreateSubmissionInput = z.infer<typeof createSubmissionSchema>;
export type GradeSubmissionInput = z.infer<typeof gradeSubmissionSchema>;
export type CreateTestInput = z.infer<typeof createTestSchema>;
export type GradeTestInput = z.infer<typeof gradeTestSchema>;
export type EnrollStudentInput = z.infer<typeof enrollStudentSchema>;
