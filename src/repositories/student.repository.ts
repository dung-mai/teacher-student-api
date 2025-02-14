import { Student } from '@prisma/client';
import { prisma } from '../lib/prisma';

export class StudentRepository {
  public async findByEmail(email: string): Promise<Student | null> {
    return prisma.student.findUnique({
      where: { email },
    });
  }

  public async updateStudentSuspended(
    email: string,
    suspended: boolean,
  ): Promise<Student> {
    return prisma.student.update({
      where: { email },
      data: { suspended },
    });
  }

  public async findByEmailsWhereNotSuspended(
    emails: string[],
  ): Promise<Student[]> {
    return prisma.student.findMany({
      where: {
        email: { in: emails },
        suspended: false,
      },
    });
  }

  public async findByTeacherId(teacherId: number): Promise<Student[]> {
    return prisma.student.findMany({
      where: {
        teacherStudents: {
          some: { teacherId },
        },
        suspended: false,
      },
    });
  }

  public async findByTeacherIds(teacherIds: number[]) {
    return prisma.student.findMany({
      where: {
        teacherStudents: {
          some: { teacherId: { in: teacherIds } },
        },
      },
      select: {
        email: true,
        teacherStudents: {
          select: { teacherId: true },
        },
      },
    });
  }
}
