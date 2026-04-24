import { Router, Response } from 'express';
import { prisma } from '../index.js';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';
import { UserRole } from '../types/constants.js';

const router = Router();

router.get('/', authenticate, authorize(UserRole.ADMIN), async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '10', role, search } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (role) {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { email: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
          teacherProfile: { select: { firstName: true, lastName: true } },
          studentProfile: { select: { firstName: true, lastName: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return res.json({
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/teachers', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const teachers = await prisma.teacher.findMany({
      select: { id: true, firstName: true, lastName: true },
    });

    return res.json(teachers);
  } catch (error) {
    console.error('Get teachers error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
