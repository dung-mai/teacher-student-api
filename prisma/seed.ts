import { PrismaClient } from '@prisma/client';
const teachers = [
  {
    email: 'teacher1@gmail.com',
    id: 1,
  },
  {
    email: 'teacher2@gmail.com',
    id: 2,
  },
];
const students = [
  {
    email: 'student1@gmail.com',
    id: 1,
  },
  {
    email: 'student2@gmail.com',
    id: 2,
  },
];

const teacherStudents = [
  {
    teacherId: 1,
    studentId: 1,
  },
  {
    teacherId: 1,
    studentId: 2,
  },
  {
    teacherId: 2,
    studentId: 2,
  },
];

const prisma = new PrismaClient();

const seedData = async () => {
  await prisma.teacherStudents.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.student.deleteMany();
  await prisma.teacher.createMany({
    data: Array.from({ length: 10 }, (_, i) => ({
      email: `teacher${i + 1}@gmail.com`,
    })),
  });
  await prisma.student.createMany({
    data: Array.from({ length: 10 }, (_, i) => ({
      email: `student${i + 1}@gmail.com`,
    })),
  });
  console.log('Data seeded');
};

seedData();
