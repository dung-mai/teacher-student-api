import { TeacherStudents } from '@prisma/client';
import {
  MSG_STUDENT_NOT_FOUND,
  MSG_STUDENTS_NOT_FOUND,
  MSG_TEACHER_NOT_FOUND,
  MSG_TEACHERS_NOT_FOUND,
} from '../constants/messages.constants';
import { NotFoundError } from '../errors/NotFoundError';
import { extractEmailsFromNotification } from '../utils/notificationParser';
import { TeacherRepository } from '../repositories/teacher.repository';
import { StudentRepository } from '../repositories/student.repository';
import { TeacherStudentRepository } from '../repositories/teacherStudent.repository';

const teacherRepo = new TeacherRepository();
const studentRepo = new StudentRepository();
const teacherStudentsRepo = new TeacherStudentRepository();
/**
 * Registers one or more students to a teacher
 * @param teacherEmail
 * @param studentsEmails
 */
export const registerStudents = async (
  teacherEmail: string,
  studentsEmails: string[],
) => {
  // Check if the teacher exists
  const teacher = await teacherRepo.findByEmail(teacherEmail);
  if (!teacher) {
    throw new NotFoundError(MSG_TEACHER_NOT_FOUND);
  }

  // Check students exist
  const students =
    await studentRepo.findByEmailsWhereNotSuspended(studentsEmails);
  if (students.length !== studentsEmails.length) {
    throw new NotFoundError(MSG_STUDENTS_NOT_FOUND);
  }

  // Register the students to the teacher
  students.forEach(async (student) => {
    await teacherStudentsRepo.upsertTeacherStudent(teacher.id, student.id);
  });
};

/**
 * Retrieves a list of students common to a given list of teachers.
 * @param teacherEmails
 */
export const getCommonStudents = async (teacherEmails: string[]) => {
  const teachers = await teacherRepo.findManyByEmails(teacherEmails);

  // Throw an error if found teachers are less than the given emails
  if (teachers.length !== teacherEmails.length) {
    throw new NotFoundError(MSG_TEACHERS_NOT_FOUND);
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
    throw new NotFoundError(MSG_STUDENT_NOT_FOUND);
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
  // Check if the teacher exists
  const teacher = await teacherRepo.findByEmail(teacherEmail);
  if (!teacher) {
    throw new NotFoundError(MSG_TEACHER_NOT_FOUND);
  }

  // Get registered unsuspended students
  const students = await studentRepo.findByTeacherId(teacher.id);
  const activeRegistered = students.map((s) => s.email);

  // Get mentioned unsuspended students
  const mentionedEmails = extractEmailsFromNotification(notification);
  if (mentionedEmails.length === 0) {
    return activeRegistered;
  }

  const activeMentioned =
    await studentRepo.findByEmailsWhereNotSuspended(mentionedEmails);
  const recipientSet = new Set([
    ...activeRegistered,
    ...activeMentioned.map((s) => s.email),
  ]);

  return Array.from(recipientSet);
};
