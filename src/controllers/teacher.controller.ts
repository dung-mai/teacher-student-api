import { Request, Response } from 'express';
import {
  getCommonStudents,
  registerStudents,
  retrieveForNotifications,
  suspendStudent,
} from '../services/teacher.service';
import catchAsync from '../utils/catchAsync';
import { BadRequestError } from '../errors/BadRequestError';
import { ERR_TEACHER_REQUIRED } from '../constants';
import { RegisterRequestDTO } from '../dtos/request/register-students-request.dto';
import { logger } from '../config/logger';
import { CommonStudentsRequestDTO } from '../dtos/request/common-students-request.dto';
import { SuspendRequestDTO } from '../dtos/request/suspend-student-request.dto';
import { RetrieveNotificationsRequestDTO } from '../dtos/request/retrieve-nofitication-request.dto';
import { RetrieveNotificationsResponseDTO } from '../dtos/response/retrieve-notification-response.dto';

export const registerStudentsController = catchAsync(
  async (req: Request, res: Response) => {
    const { teacher, students } = req.body as RegisterRequestDTO;
    logger.info('Register students', { teacher, students });

    await registerStudents(teacher, students);
    res.status(204).json({ message: 'Students registered successfully' });
  },
);

export const getCommonStudentsController = catchAsync(
  async (req: Request, res: Response) => {
    const { teacher } = req.query as unknown as CommonStudentsRequestDTO;
    if (!teacher) {
      throw new BadRequestError(ERR_TEACHER_REQUIRED);
    }
    const teacherEmails = typeof teacher === 'string' ? [teacher] : teacher;
    const students = await getCommonStudents(teacherEmails as string[]);
    res.status(200).json({ students: students });
  },
);

export const suspenseStudentController = catchAsync(
  async (req: Request, res: Response) => {
    const { student } = req.body as SuspendRequestDTO;
    await suspendStudent(student);
    res.status(204).json({ message: 'Student suspended successfully' });
  },
);

export const retrieveForNotificationsController = catchAsync(
  async (req: Request, res: Response) => {
    const { teacher, notification } =
      req.body as RetrieveNotificationsRequestDTO;
    const recipients = await retrieveForNotifications(teacher, notification);
    const response: RetrieveNotificationsResponseDTO = { recipients };
    res.status(200).json(response);
  },
);
