import { MembershipService } from '../membershipService';
import { prisma } from '../../lib/prisma';

jest.mock('../../lib/prisma', () => ({
  prisma: {
    organization: {
      findUnique: jest.fn(),
    },
    membership: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  },
}));

describe('MembershipService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addMember', () => {
    test('should add member to organization', async () => {
      const mockOrgFind = prisma.organization.findUnique as jest.Mock;
      const mockMembershipFind = prisma.membership.findUnique as jest.Mock;
      const mockUserFind = prisma.user.findUnique as jest.Mock;
      const mockCreate = prisma.membership.create as jest.Mock;

      mockOrgFind.mockResolvedValueOnce({ id: 1, name: 'Test Org' });
      mockMembershipFind
        .mockResolvedValueOnce({ role: 'OWNER' })
        .mockResolvedValueOnce(null);
      mockUserFind.mockResolvedValueOnce({ id: 2, email: 'user@test.com' });
      mockCreate.mockResolvedValueOnce({
        id: 1,
        userId: 2,
        organizationId: 1,
        role: 'MEMBER',
        user: { id: 2, email: 'user@test.com' },
        organization: { id: 1, name: 'Test Org' },
      });

      const result = await MembershipService.addMember(1, 2, 'MEMBER', 1);

      expect(result.role).toBe('MEMBER');
      expect(mockCreate).toHaveBeenCalled();
    });

    test('should throw error if organization not found', async () => {
      const mockOrgFind = prisma.organization.findUnique as jest.Mock;
      mockOrgFind.mockResolvedValueOnce(null);

      await expect(
        MembershipService.addMember(1, 2, 'MEMBER', 1)
      ).rejects.toThrow('Organization not found');
    });

    test('should throw error if user not authorized', async () => {
      const mockOrgFind = prisma.organization.findUnique as jest.Mock;
      const mockMembershipFind = prisma.membership.findUnique as jest.Mock;

      mockOrgFind.mockResolvedValueOnce({ id: 1 });
      mockMembershipFind.mockResolvedValueOnce({ role: 'MEMBER' });

      await expect(
        MembershipService.addMember(1, 2, 'MEMBER', 1)
      ).rejects.toThrow('Unauthorized');
    });

    test('should throw error if user already member', async () => {
      const mockOrgFind = prisma.organization.findUnique as jest.Mock;
      const mockMembershipFind = prisma.membership.findUnique as jest.Mock;
      const mockUserFind = prisma.user.findUnique as jest.Mock;

      mockOrgFind.mockResolvedValueOnce({ id: 1 });
      mockMembershipFind
        .mockResolvedValueOnce({ role: 'OWNER' })
        .mockResolvedValueOnce({ id: 1 });
      mockUserFind.mockResolvedValueOnce({ id: 2 });

      await expect(
        MembershipService.addMember(1, 2, 'MEMBER', 1)
      ).rejects.toThrow('already a member');
    });
  });

  describe('removeMember', () => {
    test('should remove member from organization', async () => {
      const mockOrgFind = prisma.organization.findUnique as jest.Mock;
      const mockMembershipFind = prisma.membership.findUnique as jest.Mock;
      const mockDelete = prisma.membership.delete as jest.Mock;

      mockOrgFind.mockResolvedValueOnce({ id: 1 });
      mockMembershipFind
        .mockResolvedValueOnce({ role: 'OWNER' })
        .mockResolvedValueOnce({ id: 1, role: 'MEMBER' });
      mockDelete.mockResolvedValueOnce({ id: 1 });

      const result = await MembershipService.removeMember(1, 2, 1);

      expect(result.message).toContain('removed successfully');
    });

    test('should throw error if removing owner', async () => {
      const mockOrgFind = prisma.organization.findUnique as jest.Mock;
      const mockMembershipFind = prisma.membership.findUnique as jest.Mock;

      mockOrgFind.mockResolvedValueOnce({ id: 1 });
      mockMembershipFind
        .mockResolvedValueOnce({ role: 'OWNER' })
        .mockResolvedValueOnce({ id: 1, role: 'OWNER' });

      await expect(MembershipService.removeMember(1, 2, 1)).rejects.toThrow(
        'Cannot remove the organization OWNER'
      );
    });
  });

  describe('updateMemberRole', () => {
    test('should update member role if requestor is owner', async () => {
      const mockOrgFind = prisma.organization.findUnique as jest.Mock;
      const mockMembershipFind = prisma.membership.findUnique as jest.Mock;
      const mockUpdate = prisma.membership.update as jest.Mock;

      mockOrgFind.mockResolvedValueOnce({ id: 1 });
      mockMembershipFind
        .mockResolvedValueOnce({ role: 'OWNER' })
        .mockResolvedValueOnce({ id: 1, role: 'MEMBER' });
      mockUpdate.mockResolvedValueOnce({
        id: 1,
        role: 'ADMIN',
        user: { id: 2 },
        organization: { id: 1 },
      });

      const result = await MembershipService.updateMemberRole(1, 2, 'ADMIN', 1);

      expect(result.role).toBe('ADMIN');
    });

    test('should throw error if requestor is not owner', async () => {
      const mockOrgFind = prisma.organization.findUnique as jest.Mock;
      const mockMembershipFind = prisma.membership.findUnique as jest.Mock;

      mockOrgFind.mockResolvedValueOnce({ id: 1 });
      mockMembershipFind.mockResolvedValueOnce({ role: 'MEMBER' });

      await expect(
        MembershipService.updateMemberRole(1, 2, 'ADMIN', 1)
      ).rejects.toThrow('Unauthorized');
    });
  });

  describe('getOrganizationMembers', () => {
    test('should return all organization members', async () => {
      const mockOrgFind = prisma.organization.findUnique as jest.Mock;
      const mockFindMany = prisma.membership.findMany as jest.Mock;

      mockOrgFind.mockResolvedValueOnce({ id: 1 });
      mockFindMany.mockResolvedValueOnce([
        {
          id: 1,
          userId: 1,
          organizationId: 1,
          user: {
            id: 1,
            email: 'user1@test.com',
            firstName: 'John',
            lastName: 'Doe',
            avatar: null,
          },
        },
      ]);

      const result = await MembershipService.getOrganizationMembers(1);

      expect(result).toHaveLength(1);
      expect(result[0].user.email).toBe('user1@test.com');
    });

    test('should throw error if organization not found', async () => {
      const mockOrgFind = prisma.organization.findUnique as jest.Mock;
      mockOrgFind.mockResolvedValueOnce(null);

      await expect(MembershipService.getOrganizationMembers(1)).rejects.toThrow(
        'Organization not found'
      );
    });
  });

  describe('getUserMemberships', () => {
    test('should return all user memberships', async () => {
      const mockFindMany = prisma.membership.findMany as jest.Mock;

      mockFindMany.mockResolvedValueOnce([
        {
          id: 1,
          userId: 1,
          organizationId: 1,
          organization: { id: 1, name: 'Org 1' },
        },
      ]);

      const result = await MembershipService.getUserMemberships(1);

      expect(result).toHaveLength(1);
    });
  });

  describe('getMemberById', () => {
    test('should return member details', async () => {
      const mockFindUnique = prisma.membership.findUnique as jest.Mock;

      mockFindUnique.mockResolvedValueOnce({
        id: 1,
        userId: 2,
        organizationId: 1,
        user: {
          id: 2,
          email: 'user@test.com',
          firstName: 'Jane',
          lastName: 'Doe',
          avatar: null,
        },
        organization: { id: 1, name: 'Test Org' },
      });

      const result = await MembershipService.getMemberById(1, 2);

      expect(result.user.email).toBe('user@test.com');
    });

    test('should throw error if member not found', async () => {
      const mockFindUnique = prisma.membership.findUnique as jest.Mock;
      mockFindUnique.mockResolvedValueOnce(null);

      await expect(MembershipService.getMemberById(1, 2)).rejects.toThrow(
        'Member not found'
      );
    });
  });
});
