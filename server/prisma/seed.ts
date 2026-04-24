import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const hashedPasswords = {
    admin: await bcrypt.hash('admin123', 10),
    teacher: await bcrypt.hash('teacher123', 10),
    student: await bcrypt.hash('student123', 10),
  };

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@school.edu',
      password: hashedPasswords.admin,
      role: 'ADMIN',
    },
  });

  const teacher1 = await prisma.user.create({
    data: {
      email: 'teacher@school.edu',
      password: hashedPasswords.teacher,
      role: 'TEACHER',
      teacherProfile: {
        create: {
          firstName: 'Sarah',
          lastName: 'Johnson',
          phone: '+1-555-0101',
          address: '123 Faculty Lane, Science Building Room 201',
        },
      },
    },
    include: { teacherProfile: true },
  });

  const teacher2 = await prisma.user.create({
    data: {
      email: 'teacher2@school.edu',
      password: hashedPasswords.teacher,
      role: 'TEACHER',
      teacherProfile: {
        create: {
          firstName: 'Michael',
          lastName: 'Chen',
          phone: '+1-555-0102',
          address: '456 Faculty Avenue, Math Hall Room 105',
        },
      },
    },
    include: { teacherProfile: true },
  });

  const studentUser1 = await prisma.user.create({
    data: {
      email: 'student@school.edu',
      password: hashedPasswords.student,
      role: 'STUDENT',
      studentProfile: {
        create: {
          firstName: 'Emily',
          lastName: 'Davis',
          dateOfBirth: new Date('2005-03-15'),
          email: 'emily.davis@student.edu',
          phone: '+1-555-0201',
          address: '789 Student Dormitory, Room 301',
          enrollmentDate: new Date('2023-09-01'),
          graduationYear: 2027,
          status: 'ACTIVE',
        },
      },
    },
  });

  const studentUser2 = await prisma.user.create({
    data: {
      email: 'student2@school.edu',
      password: hashedPasswords.student,
      role: 'STUDENT',
      studentProfile: {
        create: {
          firstName: 'James',
          lastName: 'Wilson',
          dateOfBirth: new Date('2005-07-22'),
          email: 'james.wilson@student.edu',
          phone: '+1-555-0202',
          address: '321 Student Housing, Apartment 5B',
          enrollmentDate: new Date('2023-09-01'),
          graduationYear: 2027,
          status: 'ACTIVE',
        },
      },
    },
  });

  const studentUser3 = await prisma.user.create({
    data: {
      email: 'student3@school.edu',
      password: hashedPasswords.student,
      role: 'STUDENT',
      studentProfile: {
        create: {
          firstName: 'Maria',
          lastName: 'Garcia',
          dateOfBirth: new Date('2004-11-08'),
          email: 'maria.garcia@student.edu',
          phone: '+1-555-0203',
          address: '654 Student Residences, Block C Room 112',
          enrollmentDate: new Date('2022-09-01'),
          graduationYear: 2026,
          status: 'ACTIVE',
        },
      },
    },
  });

  const class1 = await prisma.class.create({
    data: {
      code: 'MATH101',
      name: 'Introduction to Mathematics',
      subject: 'Mathematics',
      description: 'Fundamental mathematical concepts and problem-solving techniques',
      room: 'Room 101',
      schedule: 'Mon, Wed, Fri - 9:00 AM to 10:30 AM',
      status: 'ACTIVE',
      teacherId: teacher2.teacherProfile!.id,
    },
  });

  const class2 = await prisma.class.create({
    data: {
      code: 'SCI201',
      name: 'Advanced Physics',
      subject: 'Physics',
      description: 'In-depth study of mechanics, thermodynamics, and electromagnetism',
      room: 'Science Lab 201',
      schedule: 'Tue, Thu - 11:00 AM to 1:00 PM',
      status: 'ACTIVE',
      teacherId: teacher1.teacherProfile!.id,
    },
  });

  const class3 = await prisma.class.create({
    data: {
      code: 'ENG101',
      name: 'English Literature',
      subject: 'English',
      description: 'Analysis of classic and contemporary literary works',
      room: 'Room 305',
      schedule: 'Mon, Wed, Fri - 2:00 PM to 3:30 PM',
      status: 'ACTIVE',
      teacherId: teacher1.teacherProfile!.id,
    },
  });

  const students = await prisma.student.findMany();

  for (const student of students) {
    await prisma.enrollRequest.create({
      data: {
        studentId: student.id,
        classId: class1.id,
      },
    });
    await prisma.enrollRequest.create({
      data: {
        studentId: student.id,
        classId: class2.id,
      },
    });
  }

  const assignment1 = await prisma.assignment.create({
    data: {
      title: 'Calculus Problem Set 5',
      description: 'Complete problems 1-20 from Chapter 5. Focus on integration techniques.',
      dueDate: new Date('2026-05-01'),
      maxScore: 100,
      attachments: '[]',
      classId: class1.id,
      teacherId: teacher2.teacherProfile!.id,
    },
  });

  const assignment2 = await prisma.assignment.create({
    data: {
      title: 'Lab Report: Simple Pendulum',
      description: 'Write a comprehensive lab report on the simple pendulum experiment.',
      dueDate: new Date('2026-04-28'),
      maxScore: 50,
      attachments: '[]',
      classId: class2.id,
      teacherId: teacher1.teacherProfile!.id,
    },
  });

  const assignment3 = await prisma.assignment.create({
    data: {
      title: 'Essay: Shakespeare Analysis',
      description: 'Write a 2000-word analytical essay on Hamlet.',
      dueDate: new Date('2026-05-05'),
      maxScore: 80,
      attachments: '[]',
      classId: class3.id,
      teacherId: teacher1.teacherProfile!.id,
    },
  });

  const test1 = await prisma.test.create({
    data: {
      title: 'Midterm Examination',
      date: new Date('2026-05-10'),
      duration: 120,
      totalMarks: 100,
      syllabus: 'Chapters 1-8: Algebra, Geometry, and Basic Calculus',
      classId: class1.id,
      teacherId: teacher2.teacherProfile!.id,
    },
  });

  const test2 = await prisma.test.create({
    data: {
      title: 'Physics Quiz 3',
      date: new Date('2026-04-25'),
      duration: 45,
      totalMarks: 30,
      syllabus: 'Thermodynamics and Heat Transfer',
      classId: class2.id,
      teacherId: teacher1.teacherProfile!.id,
    },
  });

  for (const student of students) {
    await prisma.submission.create({
      data: {
        assignmentId: assignment1.id,
        studentId: student.id,
        status: 'SUBMITTED',
        submittedAt: new Date('2026-04-20'),
        score: Math.floor(Math.random() * 30) + 70,
        gradedAt: new Date('2026-04-22'),
      },
    });

    await prisma.submission.create({
      data: {
        assignmentId: assignment2.id,
        studentId: student.id,
        status: student.id === students[0].id ? 'LATE' : 'SUBMITTED',
        submittedAt: new Date('2026-04-27'),
        score: student.id === students[0].id ? 40 : Math.floor(Math.random() * 15) + 35,
        gradedAt: new Date('2026-04-28'),
      },
    });

    await prisma.testScore.create({
      data: {
        testId: test1.id,
        studentId: student.id,
        marks: Math.floor(Math.random() * 30) + 65,
        percentage: Math.floor(Math.random() * 20) + 75,
      },
    });

    // Add research progress
    const stages = ['IOC', 'Thesis First 3 Chapters', 'IRB Waiting', 'Data Collection', 'Analysis', 'Final Thesis'];
    const statuses = ['IN_PROGRESS', 'COMPLETED', 'STUCK'];
    await prisma.researchProgress.create({
      data: {
        studentId: student.id,
        stage: stages[Math.floor(Math.random() * stages.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        remarks: 'Initial research progress record.',
      },
    });
  }

  await prisma.activityLog.create({
    data: {
      action: 'Student Enrolled',
      details: 'Emily Davis enrolled in Advanced Physics',
      userId: adminUser.id,
    },
  });

  await prisma.activityLog.create({
    data: {
      action: 'Assignment Created',
      details: 'Calculus Problem Set 5 created by Michael Chen',
      teacherId: teacher2.teacherProfile!.id,
    },
  });

  await prisma.activityLog.create({
    data: {
      action: 'Test Scheduled',
      details: 'Midterm Examination scheduled for May 10, 2026',
      teacherId: teacher2.teacherProfile!.id,
    },
  });

  await prisma.activityLog.create({
    data: {
      action: 'Submission Received',
      details: 'Emily Davis submitted Lab Report: Simple Pendulum',
      studentId: students[0].id,
    },
  });

  await prisma.activityLog.create({
    data: {
      action: 'Grade Posted',
      details: 'Grades posted for Calculus Problem Set 5',
      teacherId: teacher2.teacherProfile!.id,
    },
  });

  console.log('Database seeded successfully!');
  console.log('\nDemo Credentials:');
  console.log('Admin: admin@school.edu / admin123');
  console.log('Teacher: teacher@school.edu / teacher123');
  console.log('Student: student@school.edu / student123');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
