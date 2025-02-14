import { prisma } from '../lib/prisma';
import { Student, TeacherStudents } from '@prisma/client';
import {
  ERR_STUDENT_NOT_FOUND,
  ERR_STUDENTS_NOT_FOUND,
  ERR_TEACHER_NOT_FOUND,
  ERR_TEACHERS_NOT_FOUND,
} from '../constants';
import { NotFoundError } from '../errors/NotFoundError';
import { extractEmailsFromNotification } from '../utils/notificationParser';
import { TeacherRepository } from '../repositories/teacher.repository';
import { StudentRepository } from '../repositories/student.repository';
import { TeacherStudentepository } from '../repositories/teacherStudent.repository';
import { record } from 'zod';

const teacherRepo = new TeacherRepository();
const studentRepo = new StudentRepository();
const teacherStudentsRepo = new TeacherStudentepository();
/**
 * Registers one or more students to a teacher
 * @param teacherEmail
 * @param studentsEmails
 */
export const registerStudents = async (
  teacherEmail: string,
  studentsEmails: string[],
) => {
  // Find the teacher with the given email
  const teacher = await teacherRepo.findByEmail(teacherEmail);
  if (!teacher) {
    throw new NotFoundError(ERR_TEACHER_NOT_FOUND);
  }

  // Find all students with the given emails
  const students =
    await studentRepo.findByEmailsWhereNotSuspended(studentsEmails);
  if (students.length !== studentsEmails.length) {
    throw new NotFoundError(ERR_STUDENTS_NOT_FOUND);
  }

  // Register the students to the teacher
  const studentsToRegister = students.map((student: any) => ({
    teacherId: teacher.id,
    studentId: student.id,
  }));

  await teacherStudentsRepo.createMany(studentsToRegister);
};

/**
 * Retrieves a list of students common to a given list of teachers.
 * @param teacherEmails
 */
export const getCommonStudents = async (teacherEmails: string[]) => {
  const teachers = await teacherRepo.findManyByEmails(teacherEmails);

  // Throw an error if found teachers are less than the given emails
  if (teachers.length !== teacherEmails.length) {
    throw new NotFoundError(ERR_TEACHERS_NOT_FOUND);
  }

  // Find students that registered to at least one teacher
  const students = await studentRepo.findByTeacherIds(
    teachers.map((t) => t.id),
  );

  //Filter out the students are linked to all the given teachers
  const commonstudents = students.filter((student: any) => {
    const studentTeacherIds = student.teacherStudents.map(
      (ts: TeacherStudents) => ts.teacherId,
    );
    return teachers.every((t: any) => studentTeacherIds.includes(t.id));
  });
  return commonstudents.map((student: any) => student.email);
};

/**
 * Suspense a student by email
 * @param studentEmail
 */
export const suspendStudent = async (studentEmail: string) => {
  const student = await studentRepo.findByEmail(studentEmail);
  if (!student) {
    throw new NotFoundError(ERR_STUDENT_NOT_FOUND);
  }
  await studentRepo.updateStudentSuspended(studentEmail, true);
};

/**
 * Retrieves a list of students who can receive a given notification
 * @param teacherEmail
 * @param notification
 * @returns
 */
export const retrieveForNotifications = async (
  teacherEmail: string,
  notification: string,
) => {
  const teacher = await teacherRepo.findByEmail(teacherEmail);
  if (!teacher) {
    throw new NotFoundError(ERR_TEACHER_NOT_FOUND);
  }

  // Registered unsuspended
  const students = await studentRepo.findByTeacherId(teacher.id);
  const activeRegistered = students.map((s) => s.email);

  // Mentioned unsuspended
  const mentionedEmails = extractEmailsFromNotification(notification);
  if (mentionedEmails.length === 0) {
    return activeRegistered;
  }
  const recipientSet = new Set(activeRegistered);
  const activeMentioned =
    await studentRepo.findByEmailsWhereNotSuspended(mentionedEmails);
  activeMentioned.forEach((s) => recipientSet.add(s.email));

  return Array.from(recipientSet);
};
