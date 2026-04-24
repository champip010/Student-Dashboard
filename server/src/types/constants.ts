export const UserRole = {
  ADMIN: 'ADMIN',
  TEACHER: 'TEACHER',
  STUDENT: 'STUDENT',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const StudentStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  GRADUATED: 'GRADUATED',
} as const;

export type StudentStatus = (typeof StudentStatus)[keyof typeof StudentStatus];

export const ClassStatus = {
  ACTIVE: 'ACTIVE',
  ARCHIVED: 'ARCHIVED',
} as const;

export type ClassStatus = (typeof ClassStatus)[keyof typeof ClassStatus];

export const AssignmentStatus = {
  PENDING: 'PENDING',
  SUBMITTED: 'SUBMITTED',
  LATE: 'LATE',
  MISSING: 'MISSING',
} as const;

export type AssignmentStatus = (typeof AssignmentStatus)[keyof typeof AssignmentStatus];
