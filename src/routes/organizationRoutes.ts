import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
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
 * Requires: Authentication
 */
router.post('/', authMiddleware, createOrganization);

/**
 * GET /organizations
 * Get all organizations for authenticated user
 * Requires: Authentication
 */
router.get('/', authMiddleware, getOrganizationsByUser);

/**
 * GET /organizations/:id
 * Get single organization by ID
 * Requires: Authentication
 */
router.get('/:id', authMiddleware, getOrganization);

/**
 * PUT /organizations/:id
 * Update organization by ID
 * Requires: Authentication
 */
router.put('/:id', authMiddleware, updateOrganization);

/**
 * DELETE /organizations/:id
 * Delete organization by ID
 * Requires: Authentication
 */
router.delete('/:id', authMiddleware, deleteOrganization);

export default router;
