import { Router } from 'express';
import { environmentalAuthMiddleware } from '../middlewares/environmentalAuthMiddleware';
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
  addMember
);

/**
 * DELETE /organizations/:orgId/members/:userId
 * Remove member from organization
 * Auth: Required in production, optional in development
 */
router.delete(
  '/organizations/:orgId/members/:userId',
  environmentalAuthMiddleware,
  removeMember
);

/**
 * PUT /organizations/:orgId/members/:userId
 * Update member role
 * Auth: Required in production, optional in development
 */
router.put(
  '/organizations/:orgId/members/:userId',
  environmentalAuthMiddleware,
  updateMemberRole
);

/**
 * GET /organizations/:orgId/members
 * Get all members in organization
 * Auth: Required in production, optional in development
 */
router.get(
  '/organizations/:orgId/members',
  environmentalAuthMiddleware,
  getOrganizationMembers
);

export default router;
