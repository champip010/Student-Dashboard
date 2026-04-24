import { Router, Response } from 'express';
import { prisma } from '../index.js';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';
import { UserRole } from '../types/constants.js';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '10', search, status, classId } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (classId) {
      where.enrollments = { some: { classId: classId as string } };
    }

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          enrollments: {
            include: { class: true },
          },
        },
      }),
      prisma.student.count({ where }),
    ]);

    return res.json({
      students,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get students error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: req.params.id },
      include: {
        enrollments: {
          include: { class: true },
        },
        submissions: {
          include: { assignment: true },
        },
        testScores: {
          include: { test: true },
        },
      },
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    return res.json(student);
  } catch (error) {
    console.error('Get student error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticate, authorize(UserRole.ADMIN, UserRole.TEACHER), async (req: AuthRequest, res: Response) => {
  try {
    const data = req.body;

    const student = await prisma.student.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: new Date(data.dateOfBirth),
        email: data.email,
        phone: data.phone,
        address: data.address,
        enrollmentDate: data.enrollmentDate ? new Date(data.enrollmentDate) : new Date(),
        graduationYear: data.graduationYear,
        status: data.status || 'ACTIVE',
        user: {
          create: {
            email: data.email,
            password: data.password || 'defaultpassword123',
            role: UserRole.STUDENT,
          },
        },
      },
      include: { user: true },
    });

    await prisma.activityLog.create({
      data: {
        action: 'Student Created',
        details: `${student.firstName} ${student.lastName} added to system`,
        userId: req.user!.id,
        studentId: student.id,
      },
    });

    return res.status(201).json(student);
  } catch (error) {
    console.error('Create student error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', authenticate, authorize(UserRole.ADMIN, UserRole.TEACHER), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const student = await prisma.student.update({
      where: { id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        email: data.email,
        phone: data.phone,
        address: data.address,
        graduationYear: data.graduationYear,
        status: data.status,
      },
    });

    return res.json(student);
  } catch (error) {
    console.error('Update student error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authenticate, authorize(UserRole.ADMIN), async (req: AuthRequest, res: Response) => {
  try {
    await prisma.student.delete({
      where: { id: req.params.id },
    });

    return res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Delete student error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
