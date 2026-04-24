# Student Management System - MVP

A full-stack Student Management System with TypeScript frontend and database-driven backend.

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- React Router v6
- Axios (HTTP client)
- Recharts (charts)
- TailwindCSS

### Backend
- Node.js + Express + TypeScript
- PostgreSQL (database)
- Prisma (ORM)
- JWT (authentication)
- bcrypt (password hashing)

## Project Structure

```
student-dashboard/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API services
│   │   ├── types/         # TypeScript types
│   │   ├── context/       # React context (auth, etc.)
│   │   └── utils/         # Utility functions
│   └── public/
├── server/                 # Express backend
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Express middleware
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Utility functions
│   └── prisma/            # Database schema & migrations
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+

### Environment Setup

**Backend (.env in /server)**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/student_db"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
PORT=3001
NODE_ENV=development
```

**Frontend (.env in /client)**
```env
VITE_API_URL=http://localhost:3001/api
```

### Installation & Running

```bash
# Install all dependencies
npm install

# Setup database and seed data
cd server
npx prisma migrate dev
npx prisma db seed
cd ..

# Start development servers
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## Demo Credentials

| Role    | Email              | Password    |
|---------|--------------------|-------------|
| Admin   | admin@school.edu   | admin123    |
| Teacher | teacher@school.edu | teacher123  |
| Student | student@school.edu  | student123  |

## Modules

1. **Dashboard** - KPIs, activity feed, quick actions
2. **Students** - CRUD, search, filters, profiles
3. **Classes** - Manage classes, enroll students, roster
4. **Assignments** - Create, submit, grade, track status
5. **Tests** - Schedule, record scores, export results
6. **Analytics** - Charts, performance trends, statistics

## API Documentation

OpenAPI 3.0 docs available at `/api/docs` when server is running.

## Scripts

```bash
# Development
npm run dev           # Start both servers
npm run dev:server    # Backend only
npm run dev:client    # Frontend only

# Build
npm run build         # Build for production

# Database
npm run db:migrate    # Run migrations
npm run db:seed       # Seed database
npm run db:reset      # Reset database

# Testing
npm run test          # Run all tests
npm run test:server   # Backend tests
npm run test:client   # Frontend tests
npm run lint          # Run ESLint
```

## License

MIT