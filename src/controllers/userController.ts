import { Request, Response } from 'express';
import { UserService } from '../services/userService';

/**
 * Validate user ID from request params
 * Returns parsed ID or sends error response
 */
const validateUserIdParam = (id: string, res: Response): number | null => {
  const parsedId = parseInt(id);

  if (isNaN(parsedId)) {
    res.status(400).json({
      success: false,
      message: 'Invalid user ID. Must be a number.',
    });
    return null;
  }

  return parsedId;
};
/**
 * POST /users/register
 * Register a new user
 */
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, firstName, and lastName are required.',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format.',
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    // Register user
    const user = await UserService.registerUser({
      email,
      password,
      firstName,
      lastName,
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      data: user,
    });
  } catch (error: any) {
    // Check if user already exists
    const statusCode = error.message.includes('already exists') ? 409 : 400;

    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to register user.',
    });
  }
};

/**
 * POST /users/login
 * Login user and return token
 */
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    // Authenticate user
    const result = await UserService.loginUser(email, password);

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: result,
    });
  } catch (error: any) {
    const statusCode = error.message.includes('not found') ? 404 : 401;

    res.status(statusCode).json({
      success: false,
      message: error.message || 'Login failed.',
    });
  }
};
/**
 * GET /users
 * Retrieve all users (requires authentication)
 */
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await UserService.getAllUsers();

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: users,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve users',
    });
  }
};

/**
 * GET /users/:id
 * Retrieve single user by ID (requires authentication)
 */
export const getUserById = async (req: Request, res: Response) => {
  try {
    // Validate ID parameter
    const id = validateUserIdParam(req.params.id, res);
    if (id === null) return; //

    // Fetch user from database
    const user = await UserService.getUserById(id);

    res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      data: user,
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message || 'User not found',
    });
  }
};

/**
 * PUT /users/:id
 * Update user by ID (user can only update themselves)
 */
export const updateUserById = async (req: Request, res: Response) => {
  try {
    // Validate ID parameter
    const id = validateUserIdParam(req.params.id, res);
    if (id === null) return; // Early return if validation fails

    // Get update data from request body
    const data = req.body;

    // Validate update data exists
    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No update data provided',
      });
    }

    const updatedUser = await UserService.updateUserById(id, data);

    res.status(200).json({
      success: true,
      message: `User ${id} updated successfully`,
      data: updatedUser,
    });
  } catch (error: any) {
    // 400 = bad request, 404 = not found, 500 = server error
    const statusCode = error.message.includes('not found') ? 404 : 400;

    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to update user',
    });
  }
};

/**
 * DELETE /users/:id
 * Delete user by ID (user can only delete themselves)
 */
export const deleteUserById = async (req: Request, res: Response) => {
  try {
    // Validate ID parameter
    const id = validateUserIdParam(req.params.id, res);
    if (id === null) return; //  Early return if validation fails

    const deletedUser = await UserService.deleteUserById(id);

    res.status(200).json({
      success: true,
      message: `User ${id} deleted successfully`,
      data: deletedUser,
    });
  } catch (error: any) {
    // 404 = user not found, 500 = server error
    const statusCode = error.message.includes('not found') ? 404 : 500;

    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to delete user',
    });
  }
};
