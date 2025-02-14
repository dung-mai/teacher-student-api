// // tests/routes/teacher.routes.test.ts

// import request from 'supertest';
// import { prismaMock } from '../mocks/prisma.mock';
// import { app } from '../../src/app'; // or wherever your Express app is exported

// jest.mock('../../src/lib/prisma', () => {
//   return {
//     prisma: prismaMock,
//   };
// });

// describe('Teacher Routes', () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   describe('POST /api/register', () => {
//     it('should register students and return 204', async () => {
//       prismaMock.teacher.upsert.mockResolvedValue({ id: 1, email: 'teacherken@example.com' });
//       prismaMock.student.upsert.mockResolvedValue({ id: 10, email: 'student1@example.com' });
//       prismaMock.teacherStudent.upsert.mockResolvedValue({ id: 100 });

//       const response = await request(app)
//         .post('/api/register')
//         .send({
//           teacher: 'teacherken@example.com',
//           students: ['student1@example.com'],
//         });

//       expect(response.status).toBe(204);
//       expect(prismaMock.teacher.upsert).toHaveBeenCalled();
//     });

//     it('should return 400 if payload is invalid', async () => {
//       // Missing teacher or students
//       const response = await request(app)
//         .post('/api/register')
//         .send({ teacher: '', students: [] });

//       expect(response.status).toBe(400);
//       expect(response.body.message).toContain('Validation error');
//     });
//   });

//   describe('GET /api/commonstudents', () => {
//     it('should return 200 with common students', async () => {
//       prismaMock.teacher.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);
//       prismaMock.teacherStudent.findMany
//         .mockResolvedValueOnce([{ studentId: 100 }, { studentId: 101 }])
//         .mockResolvedValueOnce([{ studentId: 100 }, { studentId: 102 }]);
//       prismaMock.student.findMany.mockResolvedValue([{ email: 'common@example.com' }]);

//       const response = await request(app)
//         .get('/api/commonstudents?teacher=teacherken@example.com&teacher=teacherjoe@example.com');

//       expect(response.status).toBe(200);
//       expect(response.body).toEqual({ students: ['common@example.com'] });
//     });

//     it('should return 400 if teacher query param is missing', async () => {
//       const response = await request(app).get('/api/commonstudents');
//       expect(response.status).toBe(400);
//       expect(response.body.message).toBe('Query param teacher is required.');
//     });
//   });

//   describe('POST /api/suspend', () => {
//     it('should suspend student and return 204', async () => {
//       prismaMock.student.findUnique.mockResolvedValue({ id: 200, email: 'student2@example.com' });
//       prismaMock.student.update.mockResolvedValue({ id: 200, email: 'student2@example.com', suspended: true });

//       const response = await request(app)
//         .post('/api/suspend')
//         .send({ student: 'student2@example.com' });

//       expect(response.status).toBe(204);
//     });

//     it('should return 400 if student email is missing', async () => {
//       const response = await request(app)
//         .post('/api/suspend')
//         .send({ noStudentProp: 'abc' });

//       expect(response.status).toBe(400);
//       expect(response.body.message).toContain('Validation error');
//     });
//   });

//   describe('POST /api/retrievefornotifications', () => {
//     it('should return 200 with recipients array', async () => {
//       // teacher
//       prismaMock.teacher.findUnique.mockResolvedValue({ id: 99, email: 'teacherken@example.com' });

//       // teacherStudents
//       prismaMock.teacherStudent.findMany.mockResolvedValue([
//         { id: 500, teacherId: 99, student: { id: 123, email: 'student1@example.com', suspended: false } },
//         { id: 501, teacherId: 99, student: { id: 124, email: 'student2@example.com', suspended: true } }, // suspended
//       ]);

//       // mentioned
//       prismaMock.student.findMany.mockResolvedValue([
//         { email: 'student3@example.com', suspended: false },
//       ]);

//       const response = await request(app)
//         .post('/api/retrievefornotifications')
//         .send({
//           teacher: 'teacherken@example.com',
//           notification: 'Hello @student3@example.com',
//         });

//       expect(response.status).toBe(200);
//       expect(response.body.recipients).toContain('student1@example.com');
//       expect(response.body.recipients).not.toContain('student2@example.com'); // suspended
//       expect(response.body.recipients).toContain('student3@example.com');
//     });

//     it('should return 400 if teacher is missing from body', async () => {
//       const response = await request(app)
//         .post('/api/retrievefornotifications')
//         .send({ notification: 'Hello' });

//       expect(response.status).toBe(400);
//       expect(response.body.message).toContain('Validation error');
//     });
//   });
// });
