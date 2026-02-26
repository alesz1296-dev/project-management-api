import { z } from 'zod';

export const createOrganizationSchema = z.object({
  name: z
    .string('Organization name must be a string')
    .min(1, 'Organization name is required')
    .max(100, 'Organization name must be less than 100 characters')
    .trim(),

  description: z
    .string('Description must be a string')
    .max(1000, 'Description must be less than 1000 characters')
    .trim()
    .optional(),

  slug: z
    .string('Slug must be a string')
    .min(1, 'Slug is required')
    .max(100, 'Slug must be less than 100 characters')
    .toLowerCase()
    .trim(),
});

export const updateOrganizationSchema = z
  .object({
    name: z
      .string('Organization name must be a string')
      .min(1, 'Organization name must have at least 1 character')
      .max(100, 'Organization name must be less than 100 characters')
      .trim()
      .optional(),

    description: z
      .string('Description must be a string')
      .max(1000, 'Description must be less than 1000 characters')
      .trim()
      .optional(),

    slug: z
      .string('Slug must be a string')
      .min(1, 'Slug must have at least 1 character')
      .max(100, 'Slug must be less than 100 characters')
      .toLowerCase()
      .trim()
      .optional(),
  })
  .strict();
