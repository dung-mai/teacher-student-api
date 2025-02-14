import { prismaMock } from '../mocks/prisma.mock';
import {
  getCommonStudents,
  registerStudents,
  retrieveForNotifications,
  suspendStudent,
} from '../../src/services/teacher.service';
import { NotFoundError } from '../../src/errors/NotFoundError';

jest.mock('../../src/lib/prisma', () => ({
  prisma: prismaMock,
}));

describe('TeacherService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerStudents', () => {
    const teacher = { id: 1, email: 'teacher1@example.com' };
    const students = [
      { id: 10, email: 'student1@example.com', suspended: false },
      { id: 11, email: 'student2@example.com', suspended: false },
    ];
    const studentEmails = students.map((s) => s.email);
    const teacherStudents = [
      { teacherId: 1, studentId: 10 },
      { teacherId: 1, studentId: 11 },
    ];
    it('should register multiple students to a teacher', async () => {
      // Mock: Teacher found
      prismaMock.teacher.findUnique.mockResolvedValue(teacher);
      // Mock: All students found
      prismaMock.student.findMany.mockResolvedValue(students);
      // Mock: Successful registration
      prismaMock.teacherStudents.createMany.mockResolvedValue(teacherStudents);

      // Act
      await registerStudents(teacher.email, studentEmails);

      // Assert
      expect(prismaMock.teacher.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { email: teacher.email },
        }),
      );

      expect(prismaMock.student.findMany).toHaveBeenCalledWith({
        where: { email: { in: studentEmails }, suspended: false },
      });

      expect(prismaMock.teacherStudents.createMany).toHaveBeenCalledWith({
        data: teacherStudents,
      });
    });

    it('should throw NotFoundError if teacher not found', async () => {
      // Mock: Teacher not found
      prismaMock.teacher.findUnique.mockResolvedValue(null);

      await expect(
        registerStudents(teacher.email, studentEmails),
      ).rejects.toThrow(NotFoundError);

      expect(prismaMock.teacher.findUnique).toHaveBeenCalledWith({
        where: { email: teacher.email },
      });
    });

    it('should throw NotFoundError if one student is not found', async () => {
      // Mock teacher found
      prismaMock.teacher.findUnique.mockResolvedValue(teacher);

      // Mock: Only one student found (missing 1)
      prismaMock.student.findMany.mockResolvedValue(students[0]);

      await expect(
        registerStudents(teacher.email, studentEmails),
      ).rejects.toThrow(NotFoundError);

      expect(prismaMock.student.findMany).toHaveBeenCalledWith({
        where: { email: { in: studentEmails }, suspended: false },
      });
    });
  });

  describe('commonStudents', () => {
    const teachers = [
      { id: 1, email: 'teacher1@example.com' },
      { id: 2, email: 'teacher2@example.com' },
    ];
    const teacherEmails = teachers.map((t) => t.email);
    const students = [
      {
        id: 10,
        email: 'student1@example.com',
        teacherStudents: [
          { teacherId: 1, studentId: 10 },
          { teacherId: 2, studentId: 10 },
        ],
      },
      {
        id: 11,
        email: 'student2@example.com',
        teacherStudents: [{ teacherId: 1, studentId: 11 }],
      },
    ];
    it('should return common students across teachers', async () => {
      prismaMock.teacher.findMany.mockResolvedValue(teachers);
      prismaMock.student.findMany.mockResolvedValue(students);

      const result = await getCommonStudents(teacherEmails);
      expect(result).toEqual([students[0].email]);
    });

    it('should return empty array if no common students found', async () => {
      prismaMock.teacher.findMany.mockResolvedValue([
        ...teachers,
        { id: 3, email: 'teacher3@example.com' },
      ]);
      prismaMock.student.findMany.mockResolvedValue(students);

      const result = await getCommonStudents([
        ...teacherEmails,
        'teacher3@example.com',
      ]);
      expect(result).toEqual([]);
    });

    it('should throw error if teacher is not found', async () => {
      // ❌ Mock: Teacher not found
      prismaMock.teacher.findMany.mockResolvedValue([teachers[0]]);

      await expect(getCommonStudents(teacherEmails)).rejects.toThrow(
        NotFoundError,
      );

      expect(prismaMock.teacher.findMany).toHaveBeenCalledWith({
        where: { email: { in: teacherEmails } },
      });
    });
  });

  describe('suspendStudent', () => {
    it('should suspend if student found', async () => {
      prismaMock.student.findUnique.mockResolvedValue({
        id: 200,
        email: 'st@example.com',
      });
      prismaMock.student.update.mockResolvedValue({
        id: 200,
        email: 'st@example.com',
        suspended: true,
      });

      await suspendStudent('st@example.com');

      expect(prismaMock.student.update).toHaveBeenCalledWith({
        where: { email: 'st@example.com' },
        data: { suspended: true },
      });
    });

    it('should throw NotFoundError if student not found', async () => {
      prismaMock.student.findUnique.mockResolvedValue(null);
      await expect(suspendStudent('nonexist@example.com')).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe('retrieveForNotifications', () => {
    const teacher = {
      id: 1,
      email: 'teacherken@example.com',
    };
    const notification = 'Hello @mentionstudent@example.com check updates!';

    it('should return students register to teacher', async () => {
      prismaMock.teacher.findUnique.mockResolvedValueOnce(teacher);

      // Mock register students
      prismaMock.student.findMany.mockResolvedValueOnce([
        {
          id: 10,
          email: 'student1@example.com',
          suspended: false,
          teacherStudents: { teacherId: teacher.id, studentId: 10 },
        },
        {
          id: 11,
          email: 'student2@example.com',
          suspended: false,
          teacherStudents: { teacherId: teacher.id, studentId: 11 },
        },
      ]);

      // Action
      const result = await retrieveForNotifications(
        teacher.email,
        'Hello students!',
      );

      expect(result).toEqual(['student1@example.com', 'student2@example.com']);
    });

    it('should throw NotFoundError if teacher is not found', async () => {
      prismaMock.teacher.findUnique.mockResolvedValue(null);

      await expect(
        retrieveForNotifications('nonexistingteacher@gmail.com', notification),
      ).rejects.toThrow(NotFoundError);

      expect(prismaMock.teacher.findUnique).toHaveBeenCalledWith({
        where: { email: 'nonexistingteacher@gmail.com' },
      });
    });

    it('should add mentioned students to the recipient list if they are not suspended', async () => {
      prismaMock.teacher.findUnique.mockResolvedValueOnce(teacher);

      // Mock register students
      prismaMock.student.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([
          { id: 13, email: 'mentionstudent@example.com', suspended: false },
        ]);

      // Action
      const result = await retrieveForNotifications(
        teacher.email,
        notification,
      );

      expect(result).toEqual(['mentionstudent@example.com']);
    });
    it('should ignore suspended students', async () => {
      prismaMock.teacher.findUnique.mockResolvedValueOnce(teacher);

      // Mock register students
      prismaMock.student.findMany.mockResolvedValueOnce([
        {
          id: 10,
          email: 'student1@example.com',
          suspended: false,
          teacherStudents: { teacherId: teacher.id, studentId: 10 },
        },
        {
          id: 11,
          email: 'student2@example.com',
          suspended: false,
          teacherStudents: { teacherId: teacher.id, studentId: 11 },
        },
      ]);
      prismaMock.student.findMany.mockResolvedValueOnce([]);

      // Action
      const result = await retrieveForNotifications(
        teacher.email,
        notification,
      );

      expect(result).toEqual(['student1@example.com', 'student2@example.com']);
    });

    it(`should return empty array if the teacher has no active students, no mentioned students`, async () => {
      prismaMock.teacher.findUnique.mockResolvedValueOnce(teacher);

      // Mock register students
      prismaMock.student.findMany.mockResolvedValue([]);

      // Action
      const result = await retrieveForNotifications(
        teacher.email,
        'Hello students!',
      );

      expect(result).toEqual([]);
      expect(prismaMock.student.findMany).toHaveBeenCalledWith({
        where: {
          teacherStudents: {
            some: { teacherId: teacher.id },
          },
          suspended: false,
        },
      });
    });
  });
});
