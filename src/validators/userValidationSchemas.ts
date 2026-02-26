import { z } from 'zod';

/**
 * Register a new user
 * POST /api/users/register
 */
export const registerUserSchema = z.object({
  email: z
    .string('Email must be a string')
    .email('Invalid email format')
    .toLowerCase()
    .trim(),

  password: z
    .string('Password must be a string')
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password must be less than 100 characters'),

  firstName: z
    .string('First name must be a string')
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .trim(),

  lastName: z
    .string('Last name must be a string')
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters')
    .trim(),
});

/**
 * Login user
 * POST /api/users/login
 */
export const loginUserSchema = z.object({
  email: z
    .string('Email must be a string')
    .email('Invalid email format')
    .toLowerCase()
    .trim(),

  password: z
    .string('Password must be a string')
    .min(1, 'Password is required'),
});

/**
 * Update user profile
 * PUT /api/users/:id
 */
export const updateUserSchema = z
  .object({
    firstName: z
      .string('First name must be a string')
      .min(1, 'First name must have at least 1 character')
      .max(50, 'First name must be less than 50 characters')
      .trim()
      .optional(),

    lastName: z
      .string('Last name must be a string')
      .min(1, 'Last name must have at least 1 character')
      .max(50, 'Last name must be less than 50 characters')
      .trim()
      .optional(),

    avatar: z
      .string('Avatar must be a string')
      .url('Avatar must be a valid URL')
      .optional(),
  })
  .strict();
