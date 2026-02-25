import { Router } from 'express';
import { environmentalAuthMiddleware } from '../middlewares/environmentalAuthMiddleware';
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
router.post('/', environmentalAuthMiddleware, createOrganization);

/**
 * GET /organizations
 * Get all organizations for authenticated user
 * Auth: Required in production, optional in development
 */
router.get('/', environmentalAuthMiddleware, getOrganizationsByUser);

/**
 * GET /organizations/:id
 * Get single organization by ID
 * Auth: Required in production, optional in development
 */
router.get('/:id', environmentalAuthMiddleware, getOrganization);

/**
 * PUT /organizations/:id
 * Update organization by ID
 * Auth: Required in production, optional in development
 */
router.put('/:id', environmentalAuthMiddleware, updateOrganization);

/**
 * DELETE /organizations/:id
 * Delete organization by ID
 * Auth: Required in production, optional in development
 */
router.delete('/:id', environmentalAuthMiddleware, deleteOrganization);

export default router;
