import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import studentRoutes from './routes/student.routes.js';
import classRoutes from './routes/class.routes.js';
import assignmentRoutes from './routes/assignment.routes.js';
import testRoutes from './routes/test.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import researchRoutes from './routes/research.routes.js';
import { errorHandler } from './middleware/errorHandler.js';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

export const prisma = new PrismaClient();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Student Management System API',
      version: '1.0.0',
      description: 'RESTful API for Student Management System',
    },
    servers: [
      { url: 'http://localhost:3001', description: 'Development server' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/research', researchRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3001;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API docs available at http://localhost:${PORT}/api/docs`);
  });
}

export default app;
