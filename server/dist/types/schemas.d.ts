import { z } from 'zod';
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const registerSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    role: z.ZodEnum<["ADMIN", "TEACHER", "STUDENT"]>;
    firstName: z.ZodString;
    lastName: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    role: "ADMIN" | "TEACHER" | "STUDENT";
    firstName: string;
    lastName: string;
}, {
    email: string;
    password: string;
    role: "ADMIN" | "TEACHER" | "STUDENT";
    firstName: string;
    lastName: string;
}>;
export declare const createStudentSchema: z.ZodObject<{
    firstName: z.ZodString;
    lastName: z.ZodString;
    dateOfBirth: z.ZodEffects<z.ZodString, Date, string>;
    email: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    enrollmentDate: z.ZodOptional<z.ZodEffects<z.ZodString, Date, string>>;
    graduationYear: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    email: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    phone?: string | undefined;
    address?: string | undefined;
    enrollmentDate?: Date | undefined;
    graduationYear?: number | undefined;
}, {
    email: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    phone?: string | undefined;
    address?: string | undefined;
    enrollmentDate?: string | undefined;
    graduationYear?: number | undefined;
}>;
export declare const updateStudentSchema: z.ZodObject<{
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    dateOfBirth: z.ZodOptional<z.ZodEffects<z.ZodString, Date, string>>;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    address: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    enrollmentDate: z.ZodOptional<z.ZodOptional<z.ZodEffects<z.ZodString, Date, string>>>;
    graduationYear: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    email?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    dateOfBirth?: Date | undefined;
    phone?: string | undefined;
    address?: string | undefined;
    enrollmentDate?: Date | undefined;
    graduationYear?: number | undefined;
}, {
    email?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    dateOfBirth?: string | undefined;
    phone?: string | undefined;
    address?: string | undefined;
    enrollmentDate?: string | undefined;
    graduationYear?: number | undefined;
}>;
export declare const createClassSchema: z.ZodObject<{
    code: z.ZodString;
    name: z.ZodString;
    subject: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    room: z.ZodOptional<z.ZodString>;
    schedule: z.ZodOptional<z.ZodString>;
    teacherId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    code: string;
    name: string;
    subject: string;
    teacherId: string;
    description?: string | undefined;
    room?: string | undefined;
    schedule?: string | undefined;
}, {
    code: string;
    name: string;
    subject: string;
    teacherId: string;
    description?: string | undefined;
    room?: string | undefined;
    schedule?: string | undefined;
}>;
export declare const updateClassSchema: z.ZodObject<Omit<{
    code: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    subject: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    room: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    schedule: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    teacherId: z.ZodOptional<z.ZodString>;
}, "teacherId">, "strip", z.ZodTypeAny, {
    code?: string | undefined;
    name?: string | undefined;
    subject?: string | undefined;
    description?: string | undefined;
    room?: string | undefined;
    schedule?: string | undefined;
}, {
    code?: string | undefined;
    name?: string | undefined;
    subject?: string | undefined;
    description?: string | undefined;
    room?: string | undefined;
    schedule?: string | undefined;
}>;
export declare const createAssignmentSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    dueDate: z.ZodEffects<z.ZodString, Date, string>;
    maxScore: z.ZodNumber;
    attachments: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    classId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    title: string;
    dueDate: Date;
    maxScore: number;
    classId: string;
    description?: string | undefined;
    attachments?: string[] | undefined;
}, {
    title: string;
    dueDate: string;
    maxScore: number;
    classId: string;
    description?: string | undefined;
    attachments?: string[] | undefined;
}>;
export declare const createSubmissionSchema: z.ZodObject<{
    assignmentId: z.ZodString;
    fileUrl: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    assignmentId: string;
    fileUrl?: string | undefined;
}, {
    assignmentId: string;
    fileUrl?: string | undefined;
}>;
export declare const gradeSubmissionSchema: z.ZodObject<{
    score: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    score: number;
}, {
    score: number;
}>;
export declare const createTestSchema: z.ZodObject<{
    title: z.ZodString;
    date: z.ZodEffects<z.ZodString, Date, string>;
    duration: z.ZodNumber;
    totalMarks: z.ZodNumber;
    syllabus: z.ZodOptional<z.ZodString>;
    classId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    date: Date;
    title: string;
    classId: string;
    duration: number;
    totalMarks: number;
    syllabus?: string | undefined;
}, {
    date: string;
    title: string;
    classId: string;
    duration: number;
    totalMarks: number;
    syllabus?: string | undefined;
}>;
export declare const gradeTestSchema: z.ZodObject<{
    studentId: z.ZodString;
    marks: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    studentId: string;
    marks: number;
}, {
    studentId: string;
    marks: number;
}>;
export declare const enrollStudentSchema: z.ZodObject<{
    studentId: z.ZodString;
    classId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    classId: string;
    studentId: string;
}, {
    classId: string;
    studentId: string;
}>;
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
//# sourceMappingURL=schemas.d.ts.map