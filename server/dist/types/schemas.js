"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enrollStudentSchema = exports.gradeTestSchema = exports.createTestSchema = exports.gradeSubmissionSchema = exports.createSubmissionSchema = exports.createAssignmentSchema = exports.updateClassSchema = exports.createClassSchema = exports.updateStudentSchema = exports.createStudentSchema = exports.registerSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
});
exports.registerSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    role: zod_1.z.enum(['ADMIN', 'TEACHER', 'STUDENT']),
    firstName: zod_1.z.string().min(1),
    lastName: zod_1.z.string().min(1),
});
exports.createStudentSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1),
    lastName: zod_1.z.string().min(1),
    dateOfBirth: zod_1.z.string().transform((str) => new Date(str)),
    email: zod_1.z.string().email(),
    phone: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    enrollmentDate: zod_1.z.string().transform((str) => new Date(str)).optional(),
    graduationYear: zod_1.z.number().int().min(2020).max(2040).optional(),
});
exports.updateStudentSchema = exports.createStudentSchema.partial();
exports.createClassSchema = zod_1.z.object({
    code: zod_1.z.string().min(2).max(10),
    name: zod_1.z.string().min(1),
    subject: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    room: zod_1.z.string().optional(),
    schedule: zod_1.z.string().optional(),
    teacherId: zod_1.z.string().uuid(),
});
exports.updateClassSchema = exports.createClassSchema.partial().omit({ teacherId: true });
exports.createAssignmentSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    dueDate: zod_1.z.string().transform((str) => new Date(str)),
    maxScore: zod_1.z.number().int().positive(),
    attachments: zod_1.z.array(zod_1.z.string()).optional(),
    classId: zod_1.z.string().uuid(),
});
exports.createSubmissionSchema = zod_1.z.object({
    assignmentId: zod_1.z.string().uuid(),
    fileUrl: zod_1.z.string().optional(),
});
exports.gradeSubmissionSchema = zod_1.z.object({
    score: zod_1.z.number().int().min(0),
});
exports.createTestSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    date: zod_1.z.string().transform((str) => new Date(str)),
    duration: zod_1.z.number().int().positive(),
    totalMarks: zod_1.z.number().int().positive(),
    syllabus: zod_1.z.string().optional(),
    classId: zod_1.z.string().uuid(),
});
exports.gradeTestSchema = zod_1.z.object({
    studentId: zod_1.z.string().uuid(),
    marks: zod_1.z.number().int().min(0),
});
exports.enrollStudentSchema = zod_1.z.object({
    studentId: zod_1.z.string().uuid(),
    classId: zod_1.z.string().uuid(),
});
//# sourceMappingURL=schemas.js.map