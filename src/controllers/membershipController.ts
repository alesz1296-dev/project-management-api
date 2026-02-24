import { Request, Response } from 'express';
import { MembershipService } from '../services/membershipService';

/**
 * ============================================
 * VALIDATION HELPERS (DRY)
 * ============================================
 */

const validateOrgId = (id: string, res: Response): number | null => {
  const orgId = parseInt(id);
  if (isNaN(orgId)) {
    res.status(400).json({
      success: false,
      message: 'Invalid organization ID. Must be a number.',
    });
    return null;
  }
  return orgId;
};

const validateUserId = (id: any, res: Response): number | null => {
  const userId = typeof id === 'string' ? parseInt(id) : id;
  if (!userId || isNaN(userId)) {
    res.status(400).json({
      success: false,
      message: 'Invalid user ID. Must be a number.',
    });
    return null;
  }
  return userId;
};

const validateRole = (
  role: string,
  res: Response
): 'OWNER' | 'ADMIN' | 'MEMBER' | null => {
  const validRoles = ['OWNER', 'ADMIN', 'MEMBER'];
  if (!validRoles.includes(role)) {
    res.status(400).json({
      success: false,
      message: 'Invalid role. Must be OWNER, ADMIN, or MEMBER.',
    });
    return null;
  }
  return role as 'OWNER' | 'ADMIN' | 'MEMBER';
};

/**
 * ============================================
 * ADD MEMBER TO ORGANIZATION
 * ============================================
 */
export const addMember = async (req: Request, res: Response) => {
  try {
    // Validate organization ID
    const orgId = validateOrgId(req.params.id, res);
    if (orgId === null) return;

    // Get authenticated user as requestor
    const requestorId = (req.user as any).id;
    if (!requestorId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. User not authenticated.',
      });
    }

    // Get user ID and role from request body
    const { userId, role } = req.body;

    // Validate user ID
    const validUserId = validateUserId(userId, res);
    if (validUserId === null) return;

    // Validate role
    const validRole = validateRole(role, res);
    if (validRole === null) return;

    // Call service to add member
    const membership = await MembershipService.addMember(
      orgId,
      validUserId,
      validRole,
      requestorId
    );

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Member added successfully.',
      data: membership,
    });
  } catch (error: any) {
    // Return 400 for validation/permission errors, 404 for not found
    const statusCode = error.message.includes('not found') ? 404 : 400;

    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to add member.',
    });
  }
};

/**
 * ============================================
 * REMOVE MEMBER FROM ORGANIZATION
 * ============================================
 */
export const removeMember = async (req: Request, res: Response) => {
  try {
    // Validate organization ID
    const orgId = validateOrgId(req.params.orgId, res);
    if (orgId === null) return;

    // Get user ID from route params
    const userId = validateUserId(req.params.userId, res);
    if (userId === null) return;

    // Get authenticated user as requestor
    const requestorId = (req.user as any).id;
    if (!requestorId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. User not authenticated.',
      });
    }

    // Call service to remove member
    const result = await MembershipService.removeMember(
      orgId,
      userId,
      requestorId
    );

    // Return success response
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    // Return 400 for validation/permission errors, 404 for not found
    const statusCode = error.message.includes('not found') ? 404 : 400;

    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to remove member.',
    });
  }
};

/**
 * ============================================
 * UPDATE MEMBER ROLE
 * ============================================
 */
export const updateMemberRole = async (req: Request, res: Response) => {
  try {
    // Validate organization ID
    const orgId = validateOrgId(req.params.orgId, res);
    if (orgId === null) return;

    // Get user ID from route params
    const userId = validateUserId(req.params.userId, res);
    if (userId === null) return;

    // Get authenticated user as requestor
    const requestorId = (req.user as any).id;
    if (!requestorId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. User not authenticated.',
      });
    }

    // Get new role from request body
    const { role } = req.body;

    // Validate role
    const validRole = validateRole(role, res);
    if (validRole === null) return;

    // Call service to update member role
    const updatedMembership = await MembershipService.updateMemberRole(
      orgId,
      userId,
      validRole,
      requestorId
    );

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Member role updated successfully.',
      data: updatedMembership,
    });
  } catch (error: any) {
    // Return 400 for validation/permission errors, 404 for not found
    const statusCode = error.message.includes('not found') ? 404 : 400;

    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to update member role.',
    });
  }
};

/**
 * ============================================
 * GET ORGANIZATION MEMBERS
 * ============================================
 */
export const getMembers = async (req: Request, res: Response) => {
  try {
    // Validate organization ID
    const orgId = validateOrgId(req.params.id, res);
    if (orgId === null) return;

    // Call service to get all members
    const members = await MembershipService.getMembers(orgId);

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Members retrieved successfully.',
      data: members,
    });
  } catch (error: any) {
    // Return 404 if organization not found
    const statusCode = error.message.includes('not found') ? 404 : 400;

    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to retrieve members.',
    });
  }
};

/**
 * ============================================
 * GET USER MEMBERSHIPS
 * ============================================
 */
export const getUserMemberships = async (req: Request, res: Response) => {
  try {
    // Get user ID from authenticated user
    const userId = (req.user as any).id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. User not authenticated.',
      });
    }

    // Call service to get user's memberships
    const memberships = await MembershipService.getUserMemberships(userId);

    // Return success response
    res.status(200).json({
      success: true,
      message: 'User memberships retrieved successfully.',
      data: memberships,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve user memberships.',
    });
  }
};

/**
 * ============================================
 * GET MEMBER DETAILS
 * ============================================
 */
export const getMember = async (req: Request, res: Response) => {
  try {
    // Validate organization ID
    const orgId = validateOrgId(req.params.orgId, res);
    if (orgId === null) return;

    // Get user ID from route params
    const userId = validateUserId(req.params.userId, res);
    if (userId === null) return;

    // Call service to get member details
    const member = await MembershipService.getMember(orgId, userId);

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Member details retrieved successfully.',
      data: member,
    });
  } catch (error: any) {
    // Return 404 if member not found
    const statusCode = error.message.includes('not found') ? 404 : 400;

    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to retrieve member details.',
    });
  }
};
