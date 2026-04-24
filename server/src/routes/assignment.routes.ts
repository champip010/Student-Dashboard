import { Router, Response } from 'express';
import { prisma } from '../index.js';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';
import { UserRole, AssignmentStatus } from '../types/constants.js';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '10', search, classId, status } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (search) {
      where.title = { contains: search as string, mode: 'insensitive' };
    }

    if (classId) {
      where.classId = classId as string;
    }

    const [assignments, total] = await Promise.all([
      prisma.assignment.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { dueDate: 'desc' },
        include: {
          class: true,
          teacher: true,
          _count: { select: { submissions: true } },
        },
      }),
      prisma.assignment.count({ where }),
    ]);

    return res.json({
      assignments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get assignments error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const assignment = await prisma.assignment.findUnique({
      where: { id: req.params.id },
      include: {
        class: true,
        teacher: true,
        submissions: {
          include: { student: true },
        },
      },
    });

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    return res.json(assignment);
  } catch (error) {
    console.error('Get assignment error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticate, authorize(UserRole.ADMIN, UserRole.TEACHER), async (req: AuthRequest, res: Response) => {
  try {
    const data = req.body;

    const assignment = await prisma.assignment.create({
      data: {
        title: data.title,
        description: data.description,
        dueDate: new Date(data.dueDate),
        maxScore: data.maxScore,
        attachments: data.attachments || [],
        classId: data.classId,
        teacherId: data.teacherId,
      },
      include: { class: true, teacher: true },
    });

    await prisma.activityLog.create({
      data: {
        action: 'Assignment Created',
        details: `${assignment.title} created for ${assignment.class.name}`,
        userId: req.user!.id,
        teacherId: data.teacherId,
      },
    });

    return res.status(201).json(assignment);
  } catch (error) {
    console.error('Create assignment error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', authenticate, authorize(UserRole.ADMIN, UserRole.TEACHER), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const assignment = await prisma.assignment.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        maxScore: data.maxScore,
        attachments: data.attachments,
      },
    });

    return res.json(assignment);
  } catch (error) {
    console.error('Update assignment error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authenticate, authorize(UserRole.ADMIN), async (req: AuthRequest, res: Response) => {
  try {
    await prisma.assignment.delete({
      where: { id: req.params.id },
    });

    return res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Delete assignment error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:id/submit', authenticate, authorize(UserRole.STUDENT), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { fileUrl } = req.body;

    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: { class: true },
    });

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    const student = await prisma.student.findUnique({
      where: { userId: req.user!.id },
    });

    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    const isLate = new Date() > assignment.dueDate;

    const submission = await prisma.submission.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId: id,
          studentId: student.id,
        },
      },
      update: {
        fileUrl,
        status: AssignmentStatus.SUBMITTED,
        submittedAt: new Date(),
      },
      create: {
        assignmentId: id,
        studentId: student.id,
        fileUrl,
        status: isLate ? AssignmentStatus.LATE : AssignmentStatus.SUBMITTED,
        submittedAt: new Date(),
      },
      include: { student: true },
    });

    await prisma.activityLog.create({
      data: {
        action: 'Submission Received',
        details: `${submission.student.firstName} submitted ${assignment.title}`,
        userId: req.user!.id,
        studentId: student.id,
      },
    });

    return res.status(201).json(submission);
  } catch (error) {
    console.error('Submit assignment error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id/grade/:studentId', authenticate, authorize(UserRole.ADMIN, UserRole.TEACHER), async (req: AuthRequest, res: Response) => {
  try {
    const { id, studentId } = req.params;
    const { score } = req.body;

    const submission = await prisma.submission.update({
      where: {
        assignmentId_studentId: {
          assignmentId: id,
          studentId,
        },
      },
      data: {
        score,
        gradedAt: new Date(),
      },
    });

    return res.json(submission);
  } catch (error) {
    console.error('Grade submission error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
