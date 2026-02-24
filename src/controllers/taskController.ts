import { Request, Response } from 'express';
import { TaskService } from '../services/taskService';

/**
 * ============================================
 * VALIDATION HELPERS (DRY)
 * ============================================
 */

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
  const validPriorities = ['LOW', 'MEDIUM', 'HIGH'];
  if (!validPriorities.includes(priority)) {
    res.status(400).json({
      success: false,
      message: 'Invalid task priority. Must be LOW, MEDIUM, or HIGH.',
    });
    return false;
  }
  return true;
};

/**
 * ============================================
 * CREATE TASK
 * ============================================
 * Can set priority, due date, and assign to user
 */
export const createTask = async (req: Request, res: Response) => {
  try {
    // Validate project ID
    const projectId = validateProjectId(req.params.projectId, res);
    if (projectId === null) return;

    // Get authenticated user
    const userId = (req.user as any).id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. User not authenticated.',
      });
    }

    // Get task data from request body
    const { title, description, priority, assignedTo, dueDate } = req.body;

    // Validate title is provided
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Task title is required.',
      });
    }

    // Validate priority if provided
    let validPriority: 'LOW' | 'MEDIUM' | 'HIGH' | undefined;
    if (priority) {
      if (!validateTaskPriority(priority, res)) return;
      validPriority = priority as 'LOW' | 'MEDIUM' | 'HIGH';
    }

    // Call service to create task
    const task = await TaskService.createTask(projectId, userId, {
      title,
      description,
      priority: validPriority,
      assignedTo,
      dueDate,
    });

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      data: task,
    });
  } catch (error: any) {
    const statusCode = error.message.includes('not found') ? 404 : 400;

    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to create task.',
    });
  }
};

/**
 * ============================================
 * GET TASKS BY PROJECT
 * ============================================
 * Supports filtering by status, priority, and assignee
 */
export const getTasks = async (req: Request, res: Response) => {
  try {
    // Validate project ID
    const projectId = validateProjectId(req.params.projectId, res);
    if (projectId === null) return;

    // Get optional filters from query params
    const { status, priority, assignedTo } = req.query;

    // Validate filters if provided
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

    let validPriority: 'LOW' | 'MEDIUM' | 'HIGH' | undefined;
    if (priority) {
      if (!validateTaskPriority(priority as string, res)) return;
      validPriority = priority as 'LOW' | 'MEDIUM' | 'HIGH';
    }

    // Call service to get tasks with filters
    const tasks = await TaskService.getTasks(projectId, {
      status: validStatus,
      priority: validPriority,
      assignedTo: assignedTo ? parseInt(assignedTo as string) : undefined,
    });

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Tasks retrieved successfully.',
      data: tasks,
    });
  } catch (error: any) {
    const statusCode = error.message.includes('not found') ? 404 : 400;

    res.status(statusCode).json({
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
    // Validate task ID
    const taskId = validateTaskId(req.params.id, res);
    if (taskId === null) return;

    // Call service to get task
    const task = await TaskService.getTask(taskId);

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Task retrieved successfully.',
      data: task,
    });
  } catch (error: any) {
    const statusCode = error.message.includes('not found') ? 404 : 400;

    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to retrieve task.',
    });
  }
};

/**
 * ============================================
 * UPDATE TASK
 * ============================================
 * Can update status with workflow validation, priority, and assignee
 */
export const updateTask = async (req: Request, res: Response) => {
  try {
    // Validate task ID
    const taskId = validateTaskId(req.params.id, res);
    if (taskId === null) return;

    // Get authenticated user
    const userId = (req.user as any).id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. User not authenticated.',
      });
    }

    // Get update data from request body
    const { title, description, status, priority, assignedTo, dueDate } =
      req.body;

    // Validate at least one field is provided
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

    // Validate status if provided
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

    // Validate priority if provided
    let validPriority: 'LOW' | 'MEDIUM' | 'HIGH' | undefined;
    if (priority) {
      if (!validateTaskPriority(priority, res)) return;
      validPriority = priority as 'LOW' | 'MEDIUM' | 'HIGH';
    }

    // Call service to update task
    const updatedTask = await TaskService.updateTask(taskId, userId, {
      title,
      description,
      status: validStatus,
      priority: validPriority,
      assignedTo,
      dueDate,
    });

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Task updated successfully.',
      data: updatedTask,
    });
  } catch (error: any) {
    const statusCode = error.message.includes('not found') ? 404 : 400;

    res.status(statusCode).json({
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
    // Validate task ID
    const taskId = validateTaskId(req.params.id, res);
    if (taskId === null) return;

    // Get authenticated user
    const userId = (req.user as any).id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. User not authenticated.',
      });
    }

    // Call service to delete task
    const result = await TaskService.deleteTask(taskId, userId);

    // Return success response
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    const statusCode = error.message.includes('not found') ? 404 : 400;

    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to delete task.',
    });
  }
};

/**
 * ============================================
 * GET MY TASKS
 * ============================================
 * Get all tasks assigned to authenticated user in an organization
 */
export const getMyTasks = async (req: Request, res: Response) => {
  try {
    // Validate organization ID
    const orgId = parseInt(req.params.orgId);
    if (isNaN(orgId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid organization ID. Must be a number.',
      });
    }

    // Get authenticated user
    const userId = (req.user as any).id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. User not authenticated.',
      });
    }

    // Call service to get user's tasks
    const tasks = await TaskService.getTasksByAssignee(userId, orgId);

    // Return success response
    res.status(200).json({
      success: true,
      message: 'User tasks retrieved successfully.',
      data: tasks,
    });
  } catch (error: any) {
    const statusCode = error.message.includes('not found') ? 404 : 400;

    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to retrieve user tasks.',
    });
  }
};

/**
 * ============================================
 * GET TASKS BY SPECIFIC USER
 * ============================================
 * Get all tasks assigned to a specific user in an organization
 */
export const getTasksByAssignee = async (req: Request, res: Response) => {
  try {
    // Validate user ID
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID. Must be a number.',
      });
    }

    // Get organizationId from query params (required)
    const organizationId = parseInt(req.query.organizationId as string);
    if (isNaN(organizationId)) {
      return res.status(400).json({
        success: false,
        message: 'Organization ID is required. Pass ?organizationId=<id>',
      });
    }

    // Call service to get user's tasks
    const tasks = await TaskService.getTasksByAssignee(userId, organizationId);

    // Return success response
    res.status(200).json({
      success: true,
      message: 'User tasks retrieved successfully.',
      data: tasks,
    });
  } catch (error: any) {
    const statusCode = error.message.includes('not found') ? 404 : 400;

    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to retrieve user tasks.',
    });
  }
};
