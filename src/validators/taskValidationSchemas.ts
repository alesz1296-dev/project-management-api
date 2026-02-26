import { z } from 'zod';

const TASK_PRIORITY = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
const TASK_STATUS = ['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const;

export const createTaskSchema = z.object({
  title: z
    .string('Task title must be a string')
    .min(1, 'Task title is required')
    .max(255, 'Task title must be less than 255 characters')
    .trim(),

  description: z
    .string('Description must be a string')
    .max(5000, 'Description must be less than 5000 characters')
    .trim()
    .optional(),

  priority: z
    .enum(TASK_PRIORITY, {
      message: `Priority must be one of: ${TASK_PRIORITY.join(', ')}`,
    })
    .optional()
    .default('MEDIUM'),

  assignedTo: z
    .number('Assigned to must be a number (user ID)')
    .int('User ID must be an integer')
    .positive('User ID must be positive')
    .optional(),

  dueDate: z.coerce.date().optional(),
});

export const updateTaskSchema = z
  .object({
    title: z
      .string('Task title must be a string')
      .min(1, 'Task title must have at least 1 character')
      .max(255, 'Task title must be less than 255 characters')
      .trim()
      .optional(),

    description: z
      .string('Description must be a string')
      .max(5000, 'Description must be less than 5000 characters')
      .trim()
      .optional(),

    priority: z
      .enum(TASK_PRIORITY, {
        message: `Priority must be one of: ${TASK_PRIORITY.join(', ')}`,
      })
      .optional(),

    status: z
      .enum(TASK_STATUS, {
        message: `Status must be one of: ${TASK_STATUS.join(', ')}`,
      })
      .optional(),

    assignedTo: z
      .number('Assigned to must be a number (user ID)')
      .int('User ID must be an integer')
      .positive('User ID must be positive')
      .optional()
      .nullable(),

    dueDate: z.coerce.date().optional().nullable(),
  })
  .strict();
