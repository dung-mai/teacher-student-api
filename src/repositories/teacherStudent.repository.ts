// Extend TeacherRepository for TeacherStudent
import { TeacherStudents } from '@prisma/client';
import { prisma } from '../lib/prisma';

export class TeacherStudentRepository {
  public async upsertTeacherStudent(
    teacherId: number,
    studentId: number,
  ): Promise<TeacherStudents> {
    return prisma.teacherStudents.upsert({
      where: {
        teacherId_studentId: { teacherId, studentId },
      },
      update: {},
      create: { teacherId, studentId },
    });
  }
}
