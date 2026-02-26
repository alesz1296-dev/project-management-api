import { Router } from 'express';
import { environmentalAuthMiddleware } from '../middlewares/environmentalAuthMiddleware';
import { asyncHandler } from '../middlewares/errorHandler';
import {
  addMember,
  removeMember,
  updateMemberRole,
  getOrganizationMembers,
} from '../controllers/membershipController';

const router = Router();

/**
 * POST /organizations/:orgId/members
 * Add member to organization
 * Auth: Required in production, optional in development
 */
router.post(
  '/organizations/:orgId/members',
  environmentalAuthMiddleware,
  asyncHandler(addMember)
);

/**
 * DELETE /organizations/:orgId/members/:userId
 * Remove member from organization
 * Auth: Required in production, optional in development
 */
router.delete(
  '/organizations/:orgId/members/:userId',
  environmentalAuthMiddleware,
  asyncHandler(removeMember)
);

/**
 * PUT /organizations/:orgId/members/:userId
 * Update member role
 * Auth: Required in production, optional in development
 */
router.put(
  '/organizations/:orgId/members/:userId',
  environmentalAuthMiddleware,
  asyncHandler(updateMemberRole)
);

/**
 * GET /organizations/:orgId/members
 * Get all members in organization
 * Auth: Required in production, optional in development
 */
router.get(
  '/organizations/:orgId/members',
  environmentalAuthMiddleware,
  asyncHandler(getOrganizationMembers)
);

export default router;
