import { Router } from 'express';
import { environmentalAuthMiddleware } from '../middlewares/environmentalAuthMiddleware';
import { asyncHandler } from '../middlewares/errorHandler';
import {
  createOrganization,
  getOrganizationsByUser,
  getOrganization,
  updateOrganization,
  deleteOrganization,
} from '../controllers/organizationController';

const router = Router();

/**
 * POST /organizations
 * Create new organization
 * Auth: Required in production, optional in development
 */
router.post('/', environmentalAuthMiddleware, asyncHandler(createOrganization));

/**
 * GET /organizations
 * Get all organizations for authenticated user
 * Auth: Required in production, optional in development
 */
router.get(
  '/',
  environmentalAuthMiddleware,
  asyncHandler(getOrganizationsByUser)
);

/**
 * GET /organizations/:id
 * Get single organization by ID
 * Auth: Required in production, optional in development
 */
router.get('/:id', environmentalAuthMiddleware, asyncHandler(getOrganization));

/**
 * PUT /organizations/:id
 * Update organization by ID
 * Auth: Required in production, optional in development
 */
router.put(
  '/:id',
  environmentalAuthMiddleware,
  asyncHandler(updateOrganization)
);

/**
 * DELETE /organizations/:id
 * Delete organization by ID
 * Auth: Required in production, optional in development
 */
router.delete(
  '/:id',
  environmentalAuthMiddleware,
  asyncHandler(deleteOrganization)
);

export default router;
