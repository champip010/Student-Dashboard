import { Router, Response } from 'express';
import { prisma } from '../index.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const [
      totalStudents,
      activeClasses,
      pendingAssignments,
      upcomingTests,
      recentActivity,
    ] = await Promise.all([
      prisma.student.count({ where: { status: 'ACTIVE' } }),
      prisma.class.count({ where: { status: 'ACTIVE' } }),
      prisma.assignment.count({
        where: {
          dueDate: { gte: new Date() },
        },
      }),
      prisma.test.count({
        where: {
          date: { gte: new Date() },
        },
      }),
      prisma.activityLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { email: true } },
          teacher: { select: { firstName: true, lastName: true } },
          student: { select: { firstName: true, lastName: true } },
        },
      }),
    ]);

    return res.json({
      kpis: {
        totalStudents,
        activeClasses,
        pendingAssignments,
        upcomingTests,
      },
      recentActivity,
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/quick-actions', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const teachers = await prisma.teacher.findMany({
      take: 5,
      select: { id: true, firstName: true, lastName: true },
    });

    const classes = await prisma.class.findMany({
      where: { status: 'ACTIVE' },
      take: 5,
      select: { id: true, name: true, code: true },
    });

    return res.json({
      teachers,
      classes,
    });
  } catch (error) {
    console.error('Get quick actions error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
