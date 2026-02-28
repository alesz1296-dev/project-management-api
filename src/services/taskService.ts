import { prisma } from '../lib/prisma';

export class TaskService {
  /**
   * ============================================
   * CREATE TASK
   * ============================================
   */
  static async createTask(
    projectId: number,
    userId: number,
    data: {
      title: string;
      description?: string;
      priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      assignedTo?: number;
      dueDate?: string;
    }
  ) {
    // Validate project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { organization: true },
    });

    if (!project) {
      throw new Error('Project not found.');
    }

    // CHECK: User is in project
    const projectMembership = await prisma.projectMembership.findUnique({
      where: {
        userId_projectId: { userId, projectId },
      },
    });

    if (!projectMembership) {
      throw new Error('Unauthorized. User is not in this project.');
    }

    // If task assigned, verify assignee is in PROJECT
    if (data.assignedTo) {
      const assigneeMembership = await prisma.projectMembership.findUnique({
        where: {
          userId_projectId: {
            userId: data.assignedTo,
            projectId,
          },
        },
      });

      if (!assigneeMembership) {
        throw new Error(
          'Cannot assign task. User is not a member of this project.'
        );
      }
    }

    // Create task
    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        projectId,
        createdBy: userId,
        assignedTo: data.assignedTo,
        priority: data.priority || 'MEDIUM',
        status: 'BACKLOG',
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      },
      include: {
        project: true,
        assignee: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return task;
  }

  /**
   * ============================================
   * GET TASKS BY PROJECT
   * ============================================
   * NOW WITH PERMISSION CHECK
   */
  static async getTasks(
    projectId: number,
    userId: number,
    filters?: {
      status?: string;
      priority?: string;
      assignedTo?: number;
    }
  ) {
    // Validate project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new Error('Project not found.');
    }

    // CHECK: User is in project
    const projectMembership = await prisma.projectMembership.findUnique({
      where: {
        userId_projectId: { userId, projectId },
      },
    });

    if (!projectMembership) {
      throw new Error('Unauthorized. User is not in this project.');
    }

    // Build where clause with filters
    const where: any = { projectId };

    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.priority) {
      where.priority = filters.priority;
    }
    if (filters?.assignedTo) {
      where.assignedTo = filters.assignedTo;
    }

    // Get tasks with optional filtering
    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
    });

    return tasks;
  }

  /**
   * ============================================
   * GET TASK BY ID
   * ============================================
   * NOW WITH PERMISSION CHECK
   */
  static async getTask(id: number, userId: number) {
    // Get task with full details
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        project: {
          include: { organization: true },
        },
        assignee: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!task) {
      throw new Error('Task not found.');
    }

    // CHECK: User is in project
    const projectMembership = await prisma.projectMembership.findUnique({
      where: {
        userId_projectId: { userId, projectId: task.projectId },
      },
    });

    if (!projectMembership) {
      throw new Error('Unauthorized. User is not in this project.');
    }

    return task;
  }

  /**
   * ============================================
   * UPDATE TASK
   * ============================================
   */
  static async updateTask(
    id: number,
    userId: number,
    data: {
      title?: string;
      description?: string;
      status?: 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
      priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      assignedTo?: number;
      dueDate?: string;
    }
  ) {
    // Get task
    const task = await prisma.task.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!task) {
      throw new Error('Task not found.');
    }

    // Check if user is member of project
    const projectMembership = await prisma.projectMembership.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId: task.projectId,
        },
      },
    });

    if (!projectMembership) {
      throw new Error('Unauthorized. User is not in this project.');
    }

    // Validate status workflow (prevent invalid transitions)
    if (data.status && !isValidStatusTransition(task.status, data.status)) {
      throw new Error(
        `Cannot transition from ${task.status} to ${data.status}.`
      );
    }

    // If reassigning, verify new assignee is in project
    if (data.assignedTo && data.assignedTo !== task.assignedTo) {
      const assigneeMembership = await prisma.projectMembership.findUnique({
        where: {
          userId_projectId: {
            userId: data.assignedTo,
            projectId: task.projectId,
          },
        },
      });

      if (!assigneeMembership) {
        throw new Error(
          'Cannot assign task. User is not a member of this project.'
        );
      }
    }

    // Update task
    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        title: data.title || task.title,
        description:
          data.description !== undefined ? data.description : task.description,
        status: data.status || task.status,
        priority: data.priority || task.priority,
        assignedTo:
          data.assignedTo !== undefined ? data.assignedTo : task.assignedTo,
        dueDate: data.dueDate ? new Date(data.dueDate) : task.dueDate,
      },
      include: {
        assignee: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return updatedTask;
  }

  /**
   * ============================================
   * DELETE TASK
   * ============================================
   */
  static async deleteTask(id: number, userId: number) {
    // Get task
    const task = await prisma.task.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!task) {
      throw new Error('Task not found.');
    }

    // Check if user is member of project
    const projectMembership = await prisma.projectMembership.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId: task.projectId,
        },
      },
    });

    if (!projectMembership) {
      throw new Error('Unauthorized. User is not in this project.');
    }

    // Delete task
    await prisma.task.delete({
      where: { id },
    });

    return { message: 'Task deleted successfully.' };
  }

  /**
   * ============================================
   * GET TASKS BY ASSIGNEE (Across Projects)
   * ============================================
   */
  static async getTasksByAssignee(userId: number, organizationId: number) {
    // CHECK: User is in organization
    const membership = await prisma.membership.findUnique({
      where: {
        userId_organizationId: { userId, organizationId },
      },
    });

    if (!membership) {
      throw new Error('Unauthorized. User is not in this organization.');
    }

    // Get all tasks assigned to user in this org
    const tasks = await prisma.task.findMany({
      where: {
        assignedTo: userId,
        project: { organizationId },
      },
      include: {
        project: true,
        assignee: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: [{ status: 'asc' }, { dueDate: 'asc' }],
    });

    return tasks;
  }

  /**
   * ============================================
   * GET MEMBERSHIP (Helper for permission checks)
   * ============================================
   */
  static async getMembership(userId: number, organizationId: number) {
    return await prisma.membership.findUnique({
      where: {
        userId_organizationId: { userId, organizationId },
      },
    });
  }

  /**
   * ============================================
   * GET ALL TASKS IN ORGANIZATION
   * ============================================
   *  NOW WITH PERMISSION CHECK
   */
  static async getAllTasksInOrganization(
    organizationId: number,
    userId: number,
    filters?: {
      status?: string;
      priority?: string;
      assignedTo?: number;
    }
  ) {
    // CHECK: User is in organization (single permission check)
    const membership = await prisma.membership.findUnique({
      where: {
        userId_organizationId: { userId, organizationId },
      },
    });

    if (!membership) {
      throw new Error('Unauthorized. User is not in this organization.');
    }

    const where: any = {
      project: { organizationId },
    };

    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.priority) {
      where.priority = filters.priority;
    }
    if (filters?.assignedTo) {
      where.assignedTo = filters.assignedTo;
    }

    // Get all tasks in organization with filters applied
    const tasks = await prisma.task.findMany({
      where,
      include: {
        project: {
          select: { id: true, name: true, organizationId: true },
        },
        assignee: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
    });

    return tasks;
  }
}
/**
 * Helper function to validate task status workflow
 */
function isValidStatusTransition(
  currentStatus: string,
  newStatus: string
): boolean {
  const validTransitions: Record<string, string[]> = {
    BACKLOG: ['TODO', 'IN_PROGRESS', 'CANCELLED'],
    TODO: ['IN_PROGRESS', 'BACKLOG', 'CANCELLED'],
    IN_PROGRESS: ['DONE', 'TODO', 'CANCELLED'],
    DONE: ['CANCELLED'],
    CANCELLED: [],
  };

  const allowedTransitions = validTransitions[currentStatus] || [];
  return allowedTransitions.includes(newStatus);
}
