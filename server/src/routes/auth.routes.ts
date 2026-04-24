import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../index.js';
import { loginSchema } from '../types/schemas.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        teacherProfile: true,
        studentProfile: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '24h' }
    );

    const { password: _, ...userData } = user;

    return res.json({
      token,
      user: userData,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(400).json({ error: 'Invalid request' });
  }
});

router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        teacherProfile: true,
        studentProfile: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password: _, ...userData } = user;

    return res.json(userData);
  } catch (error) {
    console.error('Get me error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/logout', (req, res) => {
  return res.json({ message: 'Logged out successfully' });
});

export default router;
