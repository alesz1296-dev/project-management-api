import { prisma } from '../lib/prisma';

export class OrganizationService {
  static async createOrganization(
    userId: number,
    data: { name: string; description?: string; slug: string }
  ) {
    // Step 1. Check for required Data
    if (!userId || !data.name || !data.slug) {
      throw new Error('User ID, name, and slug are required.');
    }
    const existingOrg = await prisma.organization.findUnique({
      where: { slug: data.slug },
    });
    if (existingOrg) {
      throw new Error('Organization slug already exists.');
    }
    // Step 2. Create organization and membership
    const organization = await prisma.organization.create({
      data: {
        name: data.name,
        description: data.description,
        slug: data.slug,
        ownerId: userId,
      },
    });
    await prisma.membership.create({
      data: {
        userId,
        organizationId: organization.id,
        role: 'OWNER',
      },
    });
    // Step 3. Return org object
    return organization;
  }

  static async getOrganizationsByUser(userId: number) {
    if (!userId) {
      throw new Error('User ID is required.');
    }
    const memberships = await prisma.membership.findMany({
      where: { userId },
      include: { organization: true },
    });

    return memberships.map((m) => m.organization);
  }

  static async getOrganization(id: number) {
    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        owner: true,
        memberships: true,
      },
    });

    if (!organization) {
      throw new Error('Organization not found.');
    }

    return organization;
  }

  static async updateOrganization(
    id: number,
    userId: number,
    data: { name?: string; description?: string; slug?: string }
  ) {
    // Step 1: Get organization
    const organization = await prisma.organization.findUnique({
      where: { id },
    });

    if (!organization) {
      throw new Error('Organization not found.');
    }

    // Step 2: Check authorization
    const membership = await prisma.membership.findUnique({
      where: {
        userId_organizationId: { userId, organizationId: id },
      },
    });

    if (membership?.role !== 'OWNER') {
      throw new Error('Unauthorized. Only OWNER can update organization.');
    }

    // Step 3: Check slug uniqueness
    if (data.slug && data.slug !== organization.slug) {
      const existingOrg = await prisma.organization.findUnique({
        where: { slug: data.slug },
      });
      if (existingOrg) {
        throw new Error('Slug already exists.');
      }
    }

    // Step 4: Update organization
    const updated = await prisma.organization.update({
      where: { id },
      data: {
        name: data.name || organization.name,
        description:
          data.description !== undefined
            ? data.description
            : organization.description,
        slug: data.slug || organization.slug,
      },
    });

    return updated;
  }

  static async deleteOrganization(id: number, userId: number) {
    // Step 1: Get organization
    const organization = await prisma.organization.findUnique({
      where: { id },
    });

    if (!organization) {
      throw new Error('Organization not found.');
    }

    // Step 2: Check authorization (only OWNER can delete)
    const membership = await prisma.membership.findUnique({
      where: {
        userId_organizationId: { userId, organizationId: id },
      },
    });

    if (membership?.role !== 'OWNER') {
      throw new Error('Unauthorized. Only OWNER can delete organization.');
    }

    // Step 3: Delete organization (cascades delete projects & tasks)
    await prisma.organization.delete({
      where: { id },
    });

    return { message: 'Organization deleted successfully.' };
  }
}
