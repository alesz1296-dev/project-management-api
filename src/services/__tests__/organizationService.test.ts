import { OrganizationService } from '../organizationService';
import { prisma } from '../../lib/prisma';

jest.mock('../../lib/prisma', () => ({
  prisma: {
    organization: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
    membership: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

describe('OrganizationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrganization', () => {
    test('should create a new organization with owner membership', async () => {
      const mockOrgCreate = prisma.organization.create as jest.Mock;
      const mockMembershipCreate = prisma.membership.create as jest.Mock;

      mockOrgCreate.mockResolvedValueOnce({
        id: 1,
        name: 'Test Org',
        slug: 'test-org',
        description: 'Test Description',
        ownerId: 1,
      });

      mockMembershipCreate.mockResolvedValueOnce({
        id: 1,
        userId: 1,
        organizationId: 1,
        role: 'OWNER',
      });

      const result = await OrganizationService.createOrganization(1, {
        name: 'Test Org',
        slug: 'test-org',
        description: 'Test Description',
      });

      expect(result.id).toBe(1);
      expect(result.name).toBe('Test Org');
    });

    test('should throw error if slug already exists', async () => {
      const mockFindUnique = prisma.organization.findUnique as jest.Mock;
      mockFindUnique.mockResolvedValueOnce({ id: 1, slug: 'test-org' });

      await expect(
        OrganizationService.createOrganization(1, {
          name: 'Test Org',
          slug: 'test-org',
        })
      ).rejects.toThrow('Organization slug already exists');
    });

    test('should throw error if required fields missing', async () => {
      await expect(
        OrganizationService.createOrganization(0, {
          name: 'Test',
          slug: 'test',
        })
      ).rejects.toThrow('User ID, name, and slug are required');
    });
  });

  describe('getOrganizationsByUser', () => {
    test('should return all organizations for a user', async () => {
      const mockFindMany = prisma.membership.findMany as jest.Mock;

      mockFindMany.mockResolvedValueOnce([
        {
          organization: {
            id: 1,
            name: 'Org 1',
            slug: 'org-1',
          },
        },
        {
          organization: {
            id: 2,
            name: 'Org 2',
            slug: 'org-2',
          },
        },
      ]);

      const result = await OrganizationService.getOrganizationsByUser(1);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Org 1');
    });

    test('should throw error if userId not provided', async () => {
      await expect(
        OrganizationService.getOrganizationsByUser(0)
      ).rejects.toThrow('User ID is required');
    });
  });

  describe('getOrganization', () => {
    test('should return organization by id', async () => {
      const mockFindUnique = prisma.organization.findUnique as jest.Mock;

      mockFindUnique.mockResolvedValueOnce({
        id: 1,
        name: 'Test Org',
        slug: 'test-org',
        ownerId: 1,
        owner: { id: 1, email: 'owner@test.com' },
        memberships: [],
      });

      const result = await OrganizationService.getOrganization(1);

      expect(result.id).toBe(1);
      expect(result.name).toBe('Test Org');
    });

    test('should throw error if organization not found', async () => {
      const mockFindUnique = prisma.organization.findUnique as jest.Mock;
      mockFindUnique.mockResolvedValueOnce(null);

      await expect(OrganizationService.getOrganization(999)).rejects.toThrow(
        'Organization not found'
      );
    });
  });

  describe('updateOrganization', () => {
    test('should update organization if user is owner', async () => {
      const mockOrgFind = prisma.organization.findUnique as jest.Mock;
      const mockMembershipFind = prisma.membership.findUnique as jest.Mock;
      const mockUpdate = prisma.organization.update as jest.Mock;

      mockOrgFind.mockResolvedValueOnce({
        id: 1,
        name: 'Old Name',
        slug: 'test-org',
        description: 'Old desc',
      });

      mockMembershipFind.mockResolvedValueOnce({
        role: 'OWNER',
      });

      mockUpdate.mockResolvedValueOnce({
        id: 1,
        name: 'New Name',
        slug: 'test-org',
        description: 'Old desc',
      });

      const result = await OrganizationService.updateOrganization(1, 1, {
        name: 'New Name',
      });

      expect(result.name).toBe('New Name');
    });

    test('should throw error if user is not owner', async () => {
      const mockOrgFind = prisma.organization.findUnique as jest.Mock;
      const mockMembershipFind = prisma.membership.findUnique as jest.Mock;

      mockOrgFind.mockResolvedValueOnce({
        id: 1,
        name: 'Test Org',
      });

      mockMembershipFind.mockResolvedValueOnce({
        role: 'MEMBER',
      });

      await expect(
        OrganizationService.updateOrganization(1, 1, { name: 'New' })
      ).rejects.toThrow('Unauthorized');
    });

    test('should throw error if slug already exists', async () => {
      const mockOrgFind = prisma.organization.findUnique as jest.Mock;
      const mockMembershipFind = prisma.membership.findUnique as jest.Mock;

      mockOrgFind.mockResolvedValueOnce({
        id: 1,
        name: 'Test Org',
        slug: 'test-org',
      });

      mockMembershipFind.mockResolvedValueOnce({
        role: 'OWNER',
      });

      mockOrgFind.mockResolvedValueOnce({
        id: 2,
        slug: 'new-slug',
      });

      await expect(
        OrganizationService.updateOrganization(1, 1, { slug: 'new-slug' })
      ).rejects.toThrow('Slug already exists');
    });
  });

  describe('deleteOrganization', () => {
    test('should delete organization if user is owner', async () => {
      const mockOrgFind = prisma.organization.findUnique as jest.Mock;
      const mockMembershipFind = prisma.membership.findUnique as jest.Mock;
      const mockDelete = prisma.organization.delete as jest.Mock;

      mockOrgFind.mockResolvedValueOnce({
        id: 1,
        name: 'Test Org',
      });

      mockMembershipFind.mockResolvedValueOnce({
        role: 'OWNER',
      });

      mockDelete.mockResolvedValueOnce({
        id: 1,
      });

      const result = await OrganizationService.deleteOrganization(1, 1);

      expect(result.message).toContain('deleted successfully');
    });

    test('should throw error if user is not owner', async () => {
      const mockOrgFind = prisma.organization.findUnique as jest.Mock;
      const mockMembershipFind = prisma.membership.findUnique as jest.Mock;

      mockOrgFind.mockResolvedValueOnce({
        id: 1,
        name: 'Test Org',
      });

      mockMembershipFind.mockResolvedValueOnce({
        role: 'MEMBER',
      });

      await expect(
        OrganizationService.deleteOrganization(1, 1)
      ).rejects.toThrow('Unauthorized');
    });

    test('should throw error if organization not found', async () => {
      const mockOrgFind = prisma.organization.findUnique as jest.Mock;

      mockOrgFind.mockResolvedValueOnce(null);

      await expect(
        OrganizationService.deleteOrganization(1, 1)
      ).rejects.toThrow('Organization not found');
    });
  });
});
