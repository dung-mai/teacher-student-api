// Extend TeacherRepository for TeacherStudent
import { prisma } from '../lib/prisma';

export class TeacherStudentepository {
  public async createMany(
    teacherStudentIds: { teacherId: number; studentId: number }[],
  ): Promise<unknown> {
    return prisma.teacherStudents.createMany({
      data: teacherStudentIds,
    });
  }
}
