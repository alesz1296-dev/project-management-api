import { prisma } from '../lib/prisma';

export class MembershipService {
  /**
   * ============================================
   * ADD MEMBER TO ORGANIZATION
   * ============================================
   */
  static async addMember(
    organizationId: number,
    userId: number,
    role: 'OWNER' | 'ADMIN' | 'MEMBER',
    requestorId: number
  ) {
    // Check if organization exists
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new Error('Organization not found.');
    }

    // Check if requestor is OWNER or ADMIN in this organization
    const requestorMembership = await prisma.membership.findUnique({
      where: {
        userId_organizationId: { userId: requestorId, organizationId },
      },
    });

    if (!requestorMembership || requestorMembership.role === 'MEMBER') {
      throw new Error('Unauthorized. Only OWNER or ADMIN can add members.');
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found.');
    }

    // Check if user is already a member
    const existingMembership = await prisma.membership.findUnique({
      where: {
        userId_organizationId: { userId, organizationId },
      },
    });

    if (existingMembership) {
      throw new Error('User is already a member of this organization.');
    }

    // Create membership
    const membership = await prisma.membership.create({
      data: {
        userId,
        organizationId,
        role,
      },
      include: {
        user: true,
        organization: true,
      },
    });

    return membership;
  }

  /**
   * ============================================
   * REMOVE MEMBER FROM ORGANIZATION
   * ============================================
   */
  static async removeMember(
    organizationId: number,
    userId: number,
    requestorId: number
  ) {
    // Check if organization exists
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new Error('Organization not found.');
    }

    // Check if requestor is OWNER or ADMIN
    const requestorMembership = await prisma.membership.findUnique({
      where: {
        userId_organizationId: { userId: requestorId, organizationId },
      },
    });

    if (!requestorMembership || requestorMembership.role === 'MEMBER') {
      throw new Error('Unauthorized. Only OWNER or ADMIN can remove members.');
    }

    // Check if member exists
    const membership = await prisma.membership.findUnique({
      where: {
        userId_organizationId: { userId, organizationId },
      },
    });

    if (!membership) {
      throw new Error('Member not found in this organization.');
    }

    // Prevent removing the OWNER
    if (membership.role === 'OWNER' && requestorId !== userId) {
      throw new Error('Cannot remove the organization OWNER.');
    }

    // Delete membership
    await prisma.membership.delete({
      where: {
        userId_organizationId: { userId, organizationId },
      },
    });

    return { message: 'Member removed successfully.' };
  }

  /**
   * ============================================
   * UPDATE MEMBER ROLE
   * ============================================
   */
  static async updateMemberRole(
    organizationId: number,
    userId: number,
    newRole: 'OWNER' | 'ADMIN' | 'MEMBER',
    requestorId: number
  ) {
    // Check if organization exists
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new Error('Organization not found.');
    }

    // Check if requestor is OWNER
    const requestorMembership = await prisma.membership.findUnique({
      where: {
        userId_organizationId: { userId: requestorId, organizationId },
      },
    });

    if (!requestorMembership || requestorMembership.role !== 'OWNER') {
      throw new Error('Unauthorized. Only OWNER can update member roles.');
    }

    // Check if member exists
    const membership = await prisma.membership.findUnique({
      where: {
        userId_organizationId: { userId, organizationId },
      },
    });

    if (!membership) {
      throw new Error('Member not found in this organization.');
    }

    // Prevent changing OWNER role if not self
    if (membership.role === 'OWNER' && requestorId !== userId) {
      throw new Error('Cannot change the OWNER role.');
    }

    // Update member role
    const updatedMembership = await prisma.membership.update({
      where: {
        userId_organizationId: { userId, organizationId },
      },
      data: { role: newRole },
      include: {
        user: true,
        organization: true,
      },
    });

    return updatedMembership;
  }

  /**
   * ============================================
   * GET ORGANIZATION MEMBERS
   * ============================================
   */
  static async getOrganizationMembers(organizationId: number) {
    // Check if organization exists
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new Error('Organization not found.');
    }

    // Get all members in organization
    const memberships = await prisma.membership.findMany({
      where: { organizationId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return memberships;
  }

  /**
   * ============================================
   * GET USER MEMBERSHIPS
   * ============================================
   */
  static async getUserMemberships(userId: number) {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found.');
    }

    // Get all organizations user is member of
    const memberships = await prisma.membership.findMany({
      where: { userId },
      include: {
        organization: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return memberships;
  }

  /**
   * ============================================
   * GET MEMBER BY ID DETAILS
   * ============================================
   */
  static async getMemberById(organizationId: number, userId: number) {
    // Get specific membership
    const membership = await prisma.membership.findUnique({
      where: {
        userId_organizationId: { userId, organizationId },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        organization: true,
      },
    });

    if (!membership) {
      throw new Error('Member not found in this organization.');
    }

    return membership;
  }
}
