import { prisma } from '../lib/prisma';

export class TaskService {
  /**
   * ============================================
   * CREATE TASK
   * ============================================
   * Tasks have status workflow and priority levels
   */
  static async createTask(
    projectId: number,
    userId: number,
    data: {
      title: string;
      description?: string;
      priority?: 'LOW' | 'MEDIUM' | 'HIGH';
      assignedTo?: number;
      dueDate?: string; // ISO date string
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

    // If task is assigned to someone, verify they exist and are in org
    if (data.assignedTo) {
      const assigneeMembership = await prisma.membership.findUnique({
        where: {
          userId_organizationId: {
            userId: data.assignedTo,
            organizationId: project.organizationId,
          },
        },
      });

      if (!assigneeMembership) {
        throw new Error('Assigned user is not a member of this organization.');
      }
    }

    // Create task
    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        projectId,
        assignedTo: data.assignedTo,
        priority: data.priority || 'MEDIUM',
        status: 'BACKLOG', // Tasks always start in BACKLOG
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
   * Can filter by status, priority, and assignee
   */
  static async getTasks(
    projectId: number,
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
      orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }], // Sort by priority, then due date
    });

    return tasks;
  }

  /**
   * ============================================
   * GET TASK BY ID
   * ============================================
   */
  static async getTask(id: number) {
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

    return task;
  }

  /**
   * ============================================
   * UPDATE TASK
   * ============================================
   * Can update status (workflow), priority, and assignee
   */
  static async updateTask(
    id: number,
    userId: number,
    data: {
      title?: string;
      description?: string;
      status?: 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
      priority?: 'LOW' | 'MEDIUM' | 'HIGH';
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

    // Check if user is member of organization
    const membership = await prisma.membership.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId: task.project.organizationId,
        },
      },
    });

    if (!membership) {
      throw new Error(
        'Unauthorized. User is not a member of this organization.'
      );
    }

    // Validate status workflow (prevent invalid transitions)
    if (data.status && !isValidStatusTransition(task.status, data.status)) {
      throw new Error(
        `Cannot transition from ${task.status} to ${data.status}.`
      );
    }

    // If reassigning, verify new assignee is in org
    if (data.assignedTo && data.assignedTo !== task.assignedTo) {
      const assigneeMembership = await prisma.membership.findUnique({
        where: {
          userId_organizationId: {
            userId: data.assignedTo,
            organizationId: task.project.organizationId,
          },
        },
      });

      if (!assigneeMembership) {
        throw new Error('Assigned user is not a member of this organization.');
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

    // Check if user is member of organization
    const membership = await prisma.membership.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId: task.project.organizationId,
        },
      },
    });

    if (!membership) {
      throw new Error(
        'Unauthorized. User is not a member of this organization.'
      );
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
   * Get all tasks assigned to a user across all projects
   */
  static async getTasksByAssignee(userId: number, organizationId: number) {
    // Validate user is member of organization
    const membership = await prisma.membership.findUnique({
      where: {
        userId_organizationId: { userId, organizationId },
      },
    });

    if (!membership) {
      throw new Error('User is not a member of this organization.');
    }

    // Get all tasks assigned to user in this org
    const tasks = await prisma.task.findMany({
      where: {
        assignedTo: userId,
        project: { organizationId },
      },
      include: {
        project: true,
      },
      orderBy: [{ status: 'asc' }, { dueDate: 'asc' }],
    });

    return tasks;
  }
}

/**
 * Helper function to validate task status workflow
 * Defines which status transitions are allowed
 */
function isValidStatusTransition(
  currentStatus: string,
  newStatus: string
): boolean {
  // Define valid transitions
  const validTransitions: Record<string, string[]> = {
    BACKLOG: ['TODO', 'CANCELLED'],
    TODO: ['IN_PROGRESS', 'BACKLOG', 'CANCELLED'],
    IN_PROGRESS: ['DONE', 'TODO', 'CANCELLED'],
    DONE: ['CANCELLED'], // Can only cancel a done task
    CANCELLED: [], // Cannot transition from cancelled
  };

  const allowedTransitions = validTransitions[currentStatus] || [];
  return allowedTransitions.includes(newStatus);
}
