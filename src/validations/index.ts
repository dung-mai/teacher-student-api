import { z } from 'zod';
export const registerSchema = z.object({
  teacher: z.string().email(),
  students: z.array(z.string().email()).nonempty(),
});

export const commonStudentsSchema = z.object({
  teacher: z
    .union([z.string().email(), z.array(z.string().email()).nonempty()])
    .optional(),
});

export const notificationsSchema = z.object({
  teacher: z.string().email(),
  notification: z.string().min(1),
});

export const suspendSchema = z.object({
  student: z.string().email(),
});
