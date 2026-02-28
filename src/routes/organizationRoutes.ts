import { Router } from 'express';
import { environmentalAuthMiddleware } from '../middlewares/environmentalAuthMiddleware';
import { asyncHandler } from '../middlewares/errorHandler';
import { validate } from '../middlewares/validationMiddleware';
import {
  createOrganizationSchema,
  updateOrganizationSchema,
} from '../validators/organizationValidationSchemas';
import {
  createOrganization,
  getOrganizationsByUser,
  getOrganization,
  updateOrganization,
  deleteOrganization,
} from '../controllers/organizationController';

import { getAllTasksInOrganization } from '../controllers/taskController';

const router = Router();

/**
 * POST /api/organizations
 * Create new organization
 * @param name - Organization name (required)
 * @param description - Organization description (optional)
 * @param logo - Organization logo URL (optional)
 * @returns Created organization
 */
router.post(
  '/',
  environmentalAuthMiddleware,
  validate(createOrganizationSchema),
  asyncHandler(createOrganization)
);

/**
 * GET /api/organizations
 * Get all organizations for the authenticated user
 * @returns Array of organizations
 */
router.get(
  '/',
  environmentalAuthMiddleware,
  asyncHandler(getOrganizationsByUser)
);

/**
 * GET /api/organizations/:id
 * Get a single organization by ID
 * @param orgId - Organization ID
 * @returns Organization details
 */
router.get(
  '/:orgId',
  environmentalAuthMiddleware,
  asyncHandler(getOrganization)
);

/**
 * PUT /api/organizations/:id
 * Update an organization
 * @param orgId - Organization ID
 * @param name - Organization name (optional)
 * @param description - Organization description (optional)
 * @param logo - Organization logo URL (optional)
 * @returns Updated organization
 */
router.put(
  '/:orgId',
  environmentalAuthMiddleware,
  validate(updateOrganizationSchema),
  asyncHandler(updateOrganization)
);

/**
 * DELETE /api/organizations/:id
 * Delete an organization
 * @param orgId - Organization ID
 * @returns Success message
 */
router.delete(
  '/:orgId',
  environmentalAuthMiddleware,
  asyncHandler(deleteOrganization)
);

/**
 * GET /api/organizations/:orgId/tasks
 */
router.get(
  '/:orgId/tasks',
  environmentalAuthMiddleware,
  asyncHandler(getAllTasksInOrganization)
);

export default router;
