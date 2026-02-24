import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import {
  addMember,
  removeMember,
  updateMemberRole,
  getOrganizationMembers,
  getMemberById,
  getUserMemberships,
} from '../controllers/membershipController';

const router = Router();

/**
 * POST /organizations/:orgId/members
 * Add member to organization
 */
router.post('/organizations/:orgId/members', authMiddleware, addMember);

/**
 * GET /organizations/:orgId/members
 * Get all members of organization
 */
router.get(
  '/organizations/:orgId/members',
  authMiddleware,
  getOrganizationMembers
);

/**
 * GET /organizations/:orgId/members/:userId
 * Get specific member by ID
 */
router.get(
  '/organizations/:orgId/members/:userId',
  authMiddleware,
  getMemberById
);

/**
 * PUT /organizations/:orgId/members/:userId
 * Update member role
 */
router.put(
  '/organizations/:orgId/members/:userId',
  authMiddleware,
  updateMemberRole
);

/**
 * DELETE /organizations/:orgId/members/:userId
 * Remove member from organization
 */
router.delete(
  '/organizations/:orgId/members/:userId',
  authMiddleware,
  removeMember
);

/**
 * GET /users/memberships
 * Get all memberships for authenticated user
 */
router.get('/users/memberships', authMiddleware, getUserMemberships);

export default router;
