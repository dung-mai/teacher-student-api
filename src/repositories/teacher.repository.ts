import { Teacher } from '@prisma/client';
import { prisma } from '../lib/prisma';

export class TeacherRepository {
  public async findByEmail(email: string): Promise<Teacher | null> {
    return prisma.teacher.findUnique({
      where: { email },
    });
  }

  public async findManyByEmails(emails: string[]): Promise<Teacher[]> {
    return prisma.teacher.findMany({
      where: { email: { in: emails } },
    });
  }
}
