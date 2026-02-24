import { prisma } from '../lib/prisma';

export class ProjectService {
  /**
   * ============================================
   * CREATE PROJECT
   * ============================================
   */
  static async createProject(
    organizationId: number,
    userId: number,
    data: { name: string; description?: string }
  ) {
    // Validate organization exists
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new Error('Organization not found.');
    }

    // Check if user is member of organization
    const membership = await prisma.membership.findUnique({
      where: {
        userId_organizationId: { userId, organizationId },
      },
    });

    if (!membership) {
      throw new Error(
        'Unauthorized. User is not a member of this organization.'
      );
    }

    // Create project
    const project = await prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        organizationId,
        createdBy: userId,
      },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        organization: true,
      },
    });

    return project;
  }

  /**
   * ============================================
   * GET PROJECTS BY ORGANIZATION
   * ============================================
   */
  static async getProjects(organizationId: number) {
    // Validate organization exists
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new Error('Organization not found.');
    }

    // Get all projects in organization
    const projects = await prisma.project.findMany({
      where: { organizationId },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return projects;
  }

  /**
   * ============================================
   * GET PROJECT BY ID
   * ============================================
   */
  static async getProject(id: number) {
    // Get project by ID with full details
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        organization: true,
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
          },
        },
        _count: {
          select: { tasks: true },
        },
      },
    });

    if (!project) {
      throw new Error('Project not found.');
    }

    return project;
  }

  /**
   * ============================================
   * UPDATE PROJECT
   * ============================================
   */
  static async updateProject(
    id: number,
    userId: number,
    data: {
      name?: string;
      description?: string;
      status?: 'ACTIVE' | 'ARCHIVED';
    }
  ) {
    // Get project
    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      throw new Error('Project not found.');
    }

    // Check if user is member of organization
    const membership = await prisma.membership.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId: project.organizationId,
        },
      },
    });

    if (!membership) {
      throw new Error(
        'Unauthorized. User is not a member of this organization.'
      );
    }

    // Update project
    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        name: data.name || project.name,
        description:
          data.description !== undefined
            ? data.description
            : project.description,
        status: data.status || project.status,
      },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        organization: true,
      },
    });

    return updatedProject;
  }

  /**
   * ============================================
   * DELETE PROJECT
   * ============================================
   */
  static async deleteProject(id: number, userId: number) {
    // Get project
    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      throw new Error('Project not found.');
    }

    // Check if user is member of organization
    const membership = await prisma.membership.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId: project.organizationId,
        },
      },
    });

    if (!membership) {
      throw new Error(
        'Unauthorized. User is not a member of this organization.'
      );
    }

    // Delete project (cascades delete tasks)
    await prisma.project.delete({
      where: { id },
    });

    return { message: 'Project deleted successfully.' };
  }
}
