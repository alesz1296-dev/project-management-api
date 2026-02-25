import { Request, Response } from 'express';
import { TaskService } from '../services/taskService';

/**
 * ============================================
 * HELPER FUNCTIONS (DRY)
 * ============================================
 */

const getAuthenticatedUser = (req: Request, res: Response): number | null => {
  const userId = (req.user as any).id;
  if (!userId) {
    res.status(401).json({
      success: false,
      message: 'Unauthorized. User not authenticated.',
    });
    return null;
  }
  return userId;
};

const validateProjectId = (id: string, res: Response): number | null => {
  const projectId = parseInt(id);
  if (isNaN(projectId)) {
    res.status(400).json({
      success: false,
      message: 'Invalid project ID. Must be a number.',
    });
    return null;
  }
  return projectId;
};

const validateTaskId = (id: string, res: Response): number | null => {
  const taskId = parseInt(id);
  if (isNaN(taskId)) {
    res.status(400).json({
      success: false,
      message: 'Invalid task ID. Must be a number.',
    });
    return null;
  }
  return taskId;
};

const validateTaskStatus = (status: string, res: Response): boolean => {
  const validStatuses = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED'];
  if (!validStatuses.includes(status)) {
    res.status(400).json({
      success: false,
      message:
        'Invalid task status. Must be BACKLOG, TODO, IN_PROGRESS, DONE, or CANCELLED.',
    });
    return false;
  }
  return true;
};

const validateTaskPriority = (priority: string, res: Response): boolean => {
  const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  if (!validPriorities.includes(priority)) {
    res.status(400).json({
      success: false,
      message: 'Invalid task priority. Must be LOW, MEDIUM, HIGH, or CRITICAL.',
    });
    return false;
  }
  return true;
};

const getErrorStatusCode = (error: any): number => {
  if (error.message.includes('not found')) return 404;
  if (error.message.includes('Unauthorized')) return 403;
  return 400;
};

/**
 * ============================================
 * CREATE TASK
 * ============================================
 */
export const createTask = async (req: Request, res: Response) => {
  try {
    const projectId = validateProjectId(req.params.projectId, res);
    if (projectId === null) return;

    const userId = getAuthenticatedUser(req, res);
    if (userId === null) return;

    const { title, description, priority, assignedTo, dueDate } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Task title is required.',
      });
    }

    let validPriority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | undefined;
    if (priority) {
      if (!validateTaskPriority(priority, res)) return;
      validPriority = priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    }

    const task = await TaskService.createTask(projectId, userId, {
      title,
      description,
      priority: validPriority,
      assignedTo,
      dueDate,
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      data: task,
    });
  } catch (error: any) {
    res.status(getErrorStatusCode(error)).json({
      success: false,
      message: error.message || 'Failed to create task.',
    });
  }
};

/**
 * ============================================
 * GET TASKS BY PROJECT
 * ============================================
 */
export const getTasksByProject = async (req: Request, res: Response) => {
  try {
    const projectId = validateProjectId(req.params.projectId, res);
    if (projectId === null) return;

    const userId = getAuthenticatedUser(req, res);
    if (userId === null) return;

    const { status, priority, assignedTo } = req.query;

    let validStatus:
      | 'BACKLOG'
      | 'TODO'
      | 'IN_PROGRESS'
      | 'DONE'
      | 'CANCELLED'
      | undefined;
    if (status) {
      if (!validateTaskStatus(status as string, res)) return;
      validStatus = status as
        | 'BACKLOG'
        | 'TODO'
        | 'IN_PROGRESS'
        | 'DONE'
        | 'CANCELLED';
    }

    let validPriority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | undefined;
    if (priority) {
      if (!validateTaskPriority(priority as string, res)) return;
      validPriority = priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    }

    const tasks = await TaskService.getTasks(projectId, userId, {
      status: validStatus,
      priority: validPriority,
      assignedTo: assignedTo ? parseInt(assignedTo as string) : undefined,
    });

    res.status(200).json({
      success: true,
      message: 'Tasks retrieved successfully.',
      data: tasks,
    });
  } catch (error: any) {
    res.status(getErrorStatusCode(error)).json({
      success: false,
      message: error.message || 'Failed to retrieve tasks.',
    });
  }
};

/**
 * ============================================
 * GET TASK BY ID
 * ============================================
 */
export const getTask = async (req: Request, res: Response) => {
  try {
    const taskId = validateTaskId(req.params.id, res);
    if (taskId === null) return;

    const userId = getAuthenticatedUser(req, res);
    if (userId === null) return;

    const task = await TaskService.getTask(taskId, userId);

    res.status(200).json({
      success: true,
      message: 'Task retrieved successfully.',
      data: task,
    });
  } catch (error: any) {
    res.status(getErrorStatusCode(error)).json({
      success: false,
      message: error.message || 'Failed to retrieve task.',
    });
  }
};

/**
 * ============================================
 * UPDATE TASK
 * ============================================
 */
export const updateTask = async (req: Request, res: Response) => {
  try {
    const taskId = validateTaskId(req.params.id, res);
    if (taskId === null) return;

    const userId = getAuthenticatedUser(req, res);
    if (userId === null) return;

    const { title, description, status, priority, assignedTo, dueDate } =
      req.body;

    if (
      !title &&
      !description &&
      !status &&
      !priority &&
      !assignedTo &&
      !dueDate
    ) {
      return res.status(400).json({
        success: false,
        message: 'At least one field is required to update.',
      });
    }

    let validStatus:
      | 'BACKLOG'
      | 'TODO'
      | 'IN_PROGRESS'
      | 'DONE'
      | 'CANCELLED'
      | undefined;
    if (status) {
      if (!validateTaskStatus(status, res)) return;
      validStatus = status as
        | 'BACKLOG'
        | 'TODO'
        | 'IN_PROGRESS'
        | 'DONE'
        | 'CANCELLED';
    }

    let validPriority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | undefined;
    if (priority) {
      if (!validateTaskPriority(priority, res)) return;
      validPriority = priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    }

    const updatedTask = await TaskService.updateTask(taskId, userId, {
      title,
      description,
      status: validStatus,
      priority: validPriority,
      assignedTo,
      dueDate,
    });

    res.status(200).json({
      success: true,
      message: 'Task updated successfully.',
      data: updatedTask,
    });
  } catch (error: any) {
    res.status(getErrorStatusCode(error)).json({
      success: false,
      message: error.message || 'Failed to update task.',
    });
  }
};

/**
 * ============================================
 * DELETE TASK
 * ============================================
 */
export const deleteTask = async (req: Request, res: Response) => {
  try {
    const taskId = validateTaskId(req.params.id, res);
    if (taskId === null) return;

    const userId = getAuthenticatedUser(req, res);
    if (userId === null) return;

    const result = await TaskService.deleteTask(taskId, userId);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    res.status(getErrorStatusCode(error)).json({
      success: false,
      message: error.message || 'Failed to delete task.',
    });
  }
};

/**
 * ============================================
 * GET MY TASKS
 * ============================================
 */
export const getMyTasks = async (req: Request, res: Response) => {
  try {
    const orgId = parseInt(req.params.orgId);
    if (isNaN(orgId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid organization ID. Must be a number.',
      });
    }

    const userId = getAuthenticatedUser(req, res);
    if (userId === null) return;

    const tasks = await TaskService.getTasksByAssignee(userId, orgId);

    res.status(200).json({
      success: true,
      message: 'User tasks retrieved successfully.',
      data: tasks,
    });
  } catch (error: any) {
    res.status(getErrorStatusCode(error)).json({
      success: false,
      message: error.message || 'Failed to retrieve user tasks.',
    });
  }
};

/**
 * ============================================
 * GET TASKS BY SPECIFIC USER
 * ============================================
 * Permissions: User can view their own tasks or managers/leads can view team member tasks
 */
export const getTasksByUser = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID. Must be a number.',
      });
    }

    const organizationId = parseInt(req.query.organizationId as string);
    if (isNaN(organizationId)) {
      return res.status(400).json({
        success: false,
        message: 'Organization ID is required. Pass ?organizationId=<id>',
      });
    }

    const requestingUserId = getAuthenticatedUser(req, res);
    if (requestingUserId === null) return;

    // Permission check: User can view their own tasks OR if they are a manager/lead
    if (userId !== requestingUserId) {
      const requesterMembership = await TaskService.getMembership(
        requestingUserId,
        organizationId
      );

      if (
        !requesterMembership ||
        !['OWNER', 'ADMIN'].includes(requesterMembership.role)
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You do not have permission to view this user's tasks. Only admins can view team member tasks.",
        });
      }
    }

    const tasks = await TaskService.getTasksByAssignee(userId, organizationId);

    res.status(200).json({
      success: true,
      message: 'User tasks retrieved successfully.',
      data: tasks,
    });
  } catch (error: any) {
    res.status(getErrorStatusCode(error)).json({
      success: false,
      message: error.message || 'Failed to retrieve user tasks.',
    });
  }
};

/**
 * ============================================
 * GET ALL TASKS IN ORGANIZATION
 * ============================================
 */
export const getAllTasksInOrganization = async (
  req: Request,
  res: Response
) => {
  try {
    const orgId = parseInt(req.params.orgId);
    if (isNaN(orgId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid organization ID. Must be a number.',
      });
    }

    const userId = getAuthenticatedUser(req, res);
    if (userId === null) return;

    const { status, priority, assignedTo } = req.query;

    let validStatus:
      | 'BACKLOG'
      | 'TODO'
      | 'IN_PROGRESS'
      | 'DONE'
      | 'CANCELLED'
      | undefined;
    if (status) {
      if (!validateTaskStatus(status as string, res)) return;
      validStatus = status as
        | 'BACKLOG'
        | 'TODO'
        | 'IN_PROGRESS'
        | 'DONE'
        | 'CANCELLED';
    }

    let validPriority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | undefined;
    if (priority) {
      if (!validateTaskPriority(priority as string, res)) return;
      validPriority = priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    }

    const tasks = await TaskService.getAllTasksInOrganization(orgId, userId, {
      status: validStatus,
      priority: validPriority,
      assignedTo: assignedTo ? parseInt(assignedTo as string) : undefined,
    });

    res.status(200).json({
      success: true,
      message: 'Organization tasks retrieved successfully.',
      data: tasks,
    });
  } catch (error: any) {
    res.status(getErrorStatusCode(error)).json({
      success: false,
      message: error.message || 'Failed to retrieve organization tasks.',
    });
  }
};

/**
 * ============================================
 * GET PROJECT TASKS WITH DETAILS
 * ============================================
 */
export const getProjectTasksWithDetails = async (
  req: Request,
  res: Response
) => {
  try {
    const projectId = validateProjectId(req.params.projectId, res);
    if (projectId === null) return;

    const userId = getAuthenticatedUser(req, res);
    if (userId === null) return;

    const { status, priority, assignedTo } = req.query;

    let validStatus:
      | 'BACKLOG'
      | 'TODO'
      | 'IN_PROGRESS'
      | 'DONE'
      | 'CANCELLED'
      | undefined;
    if (status) {
      if (!validateTaskStatus(status as string, res)) return;
      validStatus = status as
        | 'BACKLOG'
        | 'TODO'
        | 'IN_PROGRESS'
        | 'DONE'
        | 'CANCELLED';
    }

    let validPriority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | undefined;
    if (priority) {
      if (!validateTaskPriority(priority as string, res)) return;
      validPriority = priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    }

    const tasks = await TaskService.getTasks(projectId, userId, {
      status: validStatus,
      priority: validPriority,
      assignedTo: assignedTo ? parseInt(assignedTo as string) : undefined,
    });

    res.status(200).json({
      success: true,
      message: 'Tasks retrieved successfully.',
      data: tasks,
      summary: {
        total: tasks.length,
        byStatus: tasks.reduce(
          (acc: Record<string, number>, task: any) => {
            acc[task.status] = (acc[task.status] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        ),
        byPriority: tasks.reduce(
          (acc: Record<string, number>, task: any) => {
            acc[task.priority] = (acc[task.priority] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        ),
      },
    });
  } catch (error: any) {
    res.status(getErrorStatusCode(error)).json({
      success: false,
      message: error.message || 'Failed to retrieve tasks.',
    });
  }
};
