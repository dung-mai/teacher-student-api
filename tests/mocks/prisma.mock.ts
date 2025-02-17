export const prismaMock = {
  teacher: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    upsert: jest.fn(),
  },
  student: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  },
  teacherStudents: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
  },
};
