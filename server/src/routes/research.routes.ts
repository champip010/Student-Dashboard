import { Router, Response } from 'express';
import { prisma } from '../index.js';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';
import { UserRole } from '../types/constants.js';

const router = Router();

// Get all research progress records
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { search, stage, status } = req.query;

    const where: any = {};

    if (stage) {
      where.stage = stage;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.student = {
        OR: [
          { firstName: { contains: search as string, mode: 'insensitive' } },
          { lastName: { contains: search as string, mode: 'insensitive' } },
        ],
      };
    }

    const researchRecords = await prisma.researchProgress.findMany({
      where,
      include: {
        student: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    return res.json(researchRecords);
  } catch (error) {
    console.error('Get research progress error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get research progress for a specific student
router.get('/student/:studentId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const record = await prisma.researchProgress.findUnique({
      where: { studentId: req.params.studentId },
      include: { student: true },
    });

    if (!record) {
      return res.status(404).json({ error: 'Research record not found' });
    }

    return res.json(record);
  } catch (error) {
    console.error('Get student research error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Update or create research progress
router.post('/', authenticate, authorize(UserRole.ADMIN, UserRole.TEACHER), async (req: AuthRequest, res: Response) => {
  try {
    const { studentId, stage, status, remarks } = req.body;

    const record = await prisma.researchProgress.upsert({
      where: { studentId },
      update: {
        stage,
        status,
        remarks,
        lastUpdated: new Date(),
      },
      create: {
        studentId,
        stage,
        status,
        remarks,
        lastUpdated: new Date(),
      },
      include: { student: true },
    });

    await prisma.activityLog.create({
      data: {
        action: 'Research Progress Updated',
        details: `${record.student.firstName} ${record.student.lastName} moved to stage: ${stage}`,
        userId: req.user!.id,
        studentId: record.studentId,
      },
    });

    return res.json(record);
  } catch (error) {
    console.error('Update research progress error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete research progress
router.delete('/:studentId', authenticate, authorize(UserRole.ADMIN), async (req: AuthRequest, res: Response) => {
  try {
    const { studentId } = req.params;

    const record = await prisma.researchProgress.findUnique({
      where: { studentId },
      include: { student: true },
    });

    if (!record) {
      return res.status(404).json({ error: 'Research record not found' });
    }

    await prisma.researchProgress.delete({
      where: { studentId },
    });

    await prisma.activityLog.create({
      data: {
        action: 'Research Progress Deleted',
        details: `Research progress deleted for ${record.student.firstName} ${record.student.lastName}`,
        userId: req.user!.id,
        studentId: record.studentId,
      },
    });

    return res.json({ message: 'Research progress deleted successfully' });
  } catch (error) {
    console.error('Delete research progress error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
