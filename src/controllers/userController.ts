import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { asyncHandler } from '../middlewares/errorHandler';

/**
 * POST /users/register
 * Register a new user
 */
export const registerUser = async (req: Request, res: Response) => {
  const { email, password, firstName, lastName } = req.body;

  // Validate required fields
  if (!email || !password || !firstName || !lastName) {
    throw new Error('Email, password, firstName, and lastName are required.');
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format.');
  }

  // Validate password length
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
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
};

/**
 * POST /users/login
 * Login user and return token
 */
export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    throw new Error('Email and password are required.');
  }

  // Authenticate user
  const result = await UserService.loginUser(email, password);

  res.status(200).json({
    success: true,
    message: 'Login successful.',
    data: result,
  });
};

/**
 * GET /users
 * Retrieve all users (requires authentication)
 */
export const getAllUsers = async (req: Request, res: Response) => {
  const users = await UserService.getAllUsers();

  res.status(200).json({
    success: true,
    message: 'Users retrieved successfully',
    data: users,
  });
};

/**
 * GET /users/:id
 * Retrieve single user by ID (requires authentication)
 */
export const getUserById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    throw new Error('Invalid user ID. Must be a number.');
  }

  const user = await UserService.getUserById(id);

  res.status(200).json({
    success: true,
    message: 'User retrieved successfully',
    data: user,
  });
};

/**
 * PUT /users/:id
 * Update user by ID (user can only update themselves)
 *
 */
export const updateUserById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    throw new Error('Invalid user ID. Must be a number.');
  }

  const data = req.body;

  if (!data || Object.keys(data).length === 0) {
    throw new Error('No update data provided.');
  }

  const updatedUser = await UserService.updateUserById(id, data);

  res.status(200).json({
    success: true,
    message: `User ${id} updated successfully`,
    data: updatedUser,
  });
};

/**
 * DELETE /users/:id
 * Delete user by ID (user can only delete themselves)
 *
 */
export const deleteUserById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    throw new Error('Invalid user ID. Must be a number.');
  }

  const deletedUser = await UserService.deleteUserById(id);

  res.status(200).json({
    success: true,
    message: `User ${id} deleted successfully`,
    data: deletedUser,
  });
};
