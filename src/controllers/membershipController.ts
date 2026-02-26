import { Request, Response } from 'express';
import { MembershipService } from '../services/membershipService';

/**
 * ============================================
 * ADD MEMBER TO ORGANIZATION
 * ============================================
 */
export const addMember = async (req: Request, res: Response) => {
  const orgId = parseInt(req.params.orgId);
  const requestorId = (req.user as any).id;
  const { userId, role } = req.body;

  const membership = await MembershipService.addMember(
    orgId,
    userId,
    role,
    requestorId
  );

  res.status(201).json({
    success: true,
    message: 'Member added successfully.',
    data: membership,
  });
};

/**
 * ============================================
 * REMOVE MEMBER FROM ORGANIZATION
 * ============================================
 */
export const removeMember = async (req: Request, res: Response) => {
  const orgId = parseInt(req.params.orgId);
  const userId = parseInt(req.params.userId);
  const requestorId = (req.user as any).id;

  const result = await MembershipService.removeMember(
    orgId,
    userId,
    requestorId
  );

  res.status(200).json({
    success: true,
    message: result.message,
  });
};

/**
 * ============================================
 * UPDATE MEMBER ROLE
 * ============================================
 */
export const updateMemberRole = async (req: Request, res: Response) => {
  const orgId = parseInt(req.params.orgId);
  const userId = parseInt(req.params.userId);
  const requestorId = (req.user as any).id;
  const { role } = req.body;

  const updatedMembership = await MembershipService.updateMemberRole(
    orgId,
    userId,
    role,
    requestorId
  );

  res.status(200).json({
    success: true,
    message: 'Member role updated successfully.',
    data: updatedMembership,
  });
};

/**
 * ============================================
 * GET ORGANIZATION MEMBERS
 * ============================================
 */
export const getOrganizationMembers = async (req: Request, res: Response) => {
  const orgId = parseInt(req.params.orgId);

  const members = await MembershipService.getOrganizationMembers(orgId);

  res.status(200).json({
    success: true,
    message: 'Members retrieved successfully.',
    data: members,
  });
};

/**
 * ============================================
 * GET USER MEMBERSHIPS
 * ============================================
 */
export const getUserMemberships = async (req: Request, res: Response) => {
  const userId = (req.user as any).id;

  const memberships = await MembershipService.getUserMemberships(userId);

  res.status(200).json({
    success: true,
    message: 'User memberships retrieved successfully.',
    data: memberships,
  });
};

/**
 * ============================================
 * GET MEMBER BY ID DETAILS
 * ============================================
 */
export const getMemberById = async (req: Request, res: Response) => {
  const orgId = parseInt(req.params.orgId);
  const userId = parseInt(req.params.userId);

  const member = await MembershipService.getMemberById(orgId, userId);

  res.status(200).json({
    success: true,
    message: 'Member details retrieved successfully.',
    data: member,
  });
};
