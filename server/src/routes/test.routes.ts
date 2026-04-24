import { Router, Response } from 'express';
import { prisma } from '../index.js';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';
import { UserRole } from '../types/constants.js';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '10', search, classId } = req.query;
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

    const [tests, total] = await Promise.all([
      prisma.test.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { date: 'desc' },
        include: {
          class: true,
          teacher: true,
          _count: { select: { scores: true } },
        },
      }),
      prisma.test.count({ where }),
    ]);

    return res.json({
      tests,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get tests error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const test = await prisma.test.findUnique({
      where: { id: req.params.id },
      include: {
        class: {
          include: {
            enrollments: {
              include: { student: true },
            },
          },
        },
        teacher: true,
        scores: {
          include: { student: true },
        },
      },
    });

    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    return res.json(test);
  } catch (error) {
    console.error('Get test error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticate, authorize(UserRole.ADMIN, UserRole.TEACHER), async (req: AuthRequest, res: Response) => {
  try {
    const data = req.body;

    const test = await prisma.test.create({
      data: {
        title: data.title,
        date: new Date(data.date),
        duration: data.duration,
        totalMarks: data.totalMarks,
        syllabus: data.syllabus,
        classId: data.classId,
        teacherId: data.teacherId,
      },
      include: { class: true, teacher: true },
    });

    await prisma.activityLog.create({
      data: {
        action: 'Test Scheduled',
        details: `${test.title} scheduled for ${test.class.name}`,
        userId: req.user!.id,
        teacherId: data.teacherId,
      },
    });

    return res.status(201).json(test);
  } catch (error) {
    console.error('Create test error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', authenticate, authorize(UserRole.ADMIN, UserRole.TEACHER), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const test = await prisma.test.update({
      where: { id },
      data: {
        title: data.title,
        date: data.date ? new Date(data.date) : undefined,
        duration: data.duration,
        totalMarks: data.totalMarks,
        syllabus: data.syllabus,
      },
    });

    return res.json(test);
  } catch (error) {
    console.error('Update test error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authenticate, authorize(UserRole.ADMIN), async (req: AuthRequest, res: Response) => {
  try {
    await prisma.test.delete({
      where: { id: req.params.id },
    });

    return res.json({ message: 'Test deleted successfully' });
  } catch (error) {
    console.error('Delete test error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:id/grade', authenticate, authorize(UserRole.ADMIN, UserRole.TEACHER), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { studentId, marks } = req.body;

    const test = await prisma.test.findUnique({
      where: { id },
    });

    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    const percentage = (marks / test.totalMarks) * 100;

    const score = await prisma.testScore.upsert({
      where: {
        testId_studentId: {
          testId: id,
          studentId,
        },
      },
      update: {
        marks,
        percentage,
      },
      create: {
        testId: id,
        studentId,
        marks,
        percentage,
      },
      include: { student: true },
    });

    return res.status(201).json(score);
  } catch (error) {
    console.error('Grade test error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id/export', authenticate, authorize(UserRole.ADMIN, UserRole.TEACHER), async (req: AuthRequest, res: Response) => {
  try {
    const test = await prisma.test.findUnique({
      where: { id: req.params.id },
      include: {
        class: true,
        scores: {
          include: { student: true },
          orderBy: { percentage: 'desc' },
        },
      },
    });

    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    const csv = [
      ['Rank', 'Student Name', 'Marks', 'Percentage', 'Grade'].join(','),
      ...test.scores.map((score, index) => [
        index + 1,
        `${score.student.firstName} ${score.student.lastName}`,
        `${score.marks}/${test.totalMarks}`,
        `${score.percentage.toFixed(1)}%`,
        score.percentage >= 90 ? 'A' : score.percentage >= 80 ? 'B' : score.percentage >= 70 ? 'C' : score.percentage >= 60 ? 'D' : 'F',
      ].join(',')),
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${test.title.replace(/ /g, '_')}_results.csv"`);
    return res.send(csv);
  } catch (error) {
    console.error('Export test error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
