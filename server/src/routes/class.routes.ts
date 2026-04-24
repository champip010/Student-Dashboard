import { Router, Response } from 'express';
import { prisma } from '../index.js';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';
import { UserRole, ClassStatus } from '../types/constants.js';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '10', search, status, teacherId } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { code: { contains: search as string, mode: 'insensitive' } },
        { subject: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (teacherId) {
      where.teacherId = teacherId as string;
    }

    const [classes, total] = await Promise.all([
      prisma.class.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          teacher: true,
          _count: {
            select: { enrollments: true, assignments: true, tests: true },
          },
        },
      }),
      prisma.class.count({ where }),
    ]);

    return res.json({
      classes,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get classes error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const classData = await prisma.class.findUnique({
      where: { id: req.params.id },
      include: {
        teacher: true,
        enrollments: {
          include: { student: true },
        },
        assignments: {
          orderBy: { dueDate: 'desc' },
        },
        tests: {
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    return res.json(classData);
  } catch (error) {
    console.error('Get class error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticate, authorize(UserRole.ADMIN, UserRole.TEACHER), async (req: AuthRequest, res: Response) => {
  try {
    const data = req.body;

    const classData = await prisma.class.create({
      data: {
        code: data.code,
        name: data.name,
        subject: data.subject,
        description: data.description,
        room: data.room,
        schedule: data.schedule,
        teacherId: data.teacherId,
        status: ClassStatus.ACTIVE,
      },
      include: { teacher: true },
    });

    await prisma.activityLog.create({
      data: {
        action: 'Class Created',
        details: `${classData.name} (${classData.code}) created`,
        userId: req.user!.id,
      },
    });

    return res.status(201).json(classData);
  } catch (error) {
    console.error('Create class error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', authenticate, authorize(UserRole.ADMIN, UserRole.TEACHER), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const classData = await prisma.class.update({
      where: { id },
      data: {
        name: data.name,
        subject: data.subject,
        description: data.description,
        room: data.room,
        schedule: data.schedule,
        status: data.status,
      },
      include: { teacher: true },
    });

    return res.json(classData);
  } catch (error) {
    console.error('Update class error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:id/archive', authenticate, authorize(UserRole.ADMIN), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const classData = await prisma.class.update({
      where: { id },
      data: { status: ClassStatus.ARCHIVED },
    });

    return res.json(classData);
  } catch (error) {
    console.error('Archive class error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authenticate, authorize(UserRole.ADMIN), async (req: AuthRequest, res: Response) => {
  try {
    await prisma.class.delete({
      where: { id: req.params.id },
    });

    return res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    console.error('Delete class error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:id/enroll', authenticate, authorize(UserRole.ADMIN, UserRole.TEACHER), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { studentId } = req.body;

    const enrollment = await prisma.enrollRequest.create({
      data: {
        studentId,
        classId: id,
      },
      include: { student: true, class: true },
    });

    await prisma.activityLog.create({
      data: {
        action: 'Student Enrolled',
        details: `${enrollment.student.firstName} enrolled in ${enrollment.class.name}`,
        userId: req.user!.id,
      },
    });

    return res.status(201).json(enrollment);
  } catch (error) {
    console.error('Enroll student error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id/enroll/:studentId', authenticate, authorize(UserRole.ADMIN, UserRole.TEACHER), async (req: AuthRequest, res: Response) => {
  try {
    await prisma.enrollRequest.delete({
      where: {
        studentId_classId: {
          studentId: req.params.studentId,
          classId: req.params.id,
        },
      },
    });

    return res.json({ message: 'Student unenrolled successfully' });
  } catch (error) {
    console.error('Unenroll student error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
