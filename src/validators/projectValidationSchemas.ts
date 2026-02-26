import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z
    .string('Project name must be a string')
    .min(1, 'Project name is required')
    .max(100, 'Project name must be less than 100 characters')
    .trim(),

  description: z
    .string('Description must be a string')
    .max(2000, 'Description must be less than 2000 characters')
    .trim()
    .optional(),
});

export const updateProjectSchema = z
  .object({
    name: z
      .string('Project name must be a string')
      .min(1, 'Project name must have at least 1 character')
      .max(100, 'Project name must be less than 100 characters')
      .trim()
      .optional(),

    description: z
      .string('Description must be a string')
      .max(2000, 'Description must be less than 2000 characters')
      .trim()
      .optional(),

    status: z
      .enum(['ACTIVE', 'ARCHIVED'], {
        message: "Status must be 'ACTIVE' or 'ARCHIVED'",
      })
      .optional(),
  })
  .strict();

export const addProjectMemberSchema = z.object({
  userId: z
    .number('User ID must be a number')
    .int('User ID must be an integer')
    .positive('User ID must be positive'),

  role: z
    .enum(['MEMBER', 'LEAD', 'ADMIN', 'VIEWER'], {
      message: "Role must be 'MEMBER', 'LEAD', 'ADMIN', or 'VIEWER'",
    })
    .optional()
    .default('MEMBER'),
});

export const updateProjectMemberSchema = z
  .object({
    role: z.enum(['MEMBER', 'LEAD', 'ADMIN', 'VIEWER'], {
      message: "Role must be 'MEMBER', 'LEAD', 'ADMIN', or 'VIEWER'",
    }),
  })
  .strict();
