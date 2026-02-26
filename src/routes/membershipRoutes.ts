import { Router } from 'express';
import { environmentalAuthMiddleware } from '../middlewares/environmentalAuthMiddleware';
import { asyncHandler } from '../middlewares/errorHandler';
import { validate } from '../middlewares/validationMiddleware';
import {
  addMemberSchema,
  updateMemberRoleSchema,
} from '../validators/membershipValidationSchemas';
import {
  addMember,
  removeMember,
  updateMemberRole,
  getOrganizationMembers,
} from '../controllers/membershipController';

const router = Router();

/**
 * POST /api/organizations/:orgId/members
 * Add a member to an organization
 * @param orgId - Organization ID
 * @param userId - User ID to add (required)
 * @param role - User role in organization: MEMBER, LEAD, ADMIN, OWNER (optional, defaults to MEMBER)
 * @returns Organization member details
 */
router.post(
  '/organizations/:orgId/members',
  environmentalAuthMiddleware,
  validate(addMemberSchema),
  asyncHandler(addMember)
);

/**
 * DELETE /api/organizations/:orgId/members/:userId
 * Remove a member from an organization
 * @param orgId - Organization ID
 * @param userId - User ID to remove
 * @returns Success message
 */
router.delete(
  '/organizations/:orgId/members/:userId',
  environmentalAuthMiddleware,
  asyncHandler(removeMember)
);

/**
 * PUT /api/organizations/:orgId/members/:userId
 * Update a member's role in an organization
 * @param orgId - Organization ID
 * @param userId - User ID
 * @param role - User role in organization: MEMBER, LEAD, ADMIN, OWNER (required)
 * @returns Updated organization member details
 */
router.put(
  '/organizations/:orgId/members/:userId',
  environmentalAuthMiddleware,
  validate(updateMemberRoleSchema),
  asyncHandler(updateMemberRole)
);

/**
 * GET /api/organizations/:orgId/members
 * Get all members of an organization
 * @param orgId - Organization ID
 * @returns Array of organization members
 */
router.get(
  '/organizations/:orgId/members',
  environmentalAuthMiddleware,
  asyncHandler(getOrganizationMembers)
);

export default router;
