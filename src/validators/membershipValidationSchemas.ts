import { z } from 'zod';

const MEMBERSHIP_ROLES = ['MEMBER', 'LEAD', 'ADMIN', 'OWNER'] as const;

export const addMemberSchema = z.object({
  userId: z
    .number('User ID must be a number')
    .int('User ID must be an integer')
    .positive('User ID must be positive'),

  role: z
    .enum(MEMBERSHIP_ROLES, {
      message: `Role must be one of: ${MEMBERSHIP_ROLES.join(', ')}`,
    })
    .optional()
    .default('MEMBER'),
});

export const updateMemberRoleSchema = z
  .object({
    role: z.enum(MEMBERSHIP_ROLES, {
      message: `Role must be one of: ${MEMBERSHIP_ROLES.join(', ')}`,
    }),
  })
  .strict();
