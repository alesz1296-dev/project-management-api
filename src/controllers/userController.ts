import { Request, Response } from 'express';
import { UserService } from '../services/userService';

/**
 * ============================================
 * REGISTER USER
 * ============================================
 */
export const registerUser = async (req: Request, res: Response) => {
  const { email, password, firstName, lastName } = req.body;

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
 * ============================================
 * LOGIN USER
 * ============================================
 */
export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const result = await UserService.loginUser(email, password);

  res.status(200).json({
    success: true,
    message: 'Login successful.',
    data: result,
  });
};

/**
 * ============================================
 * GET ALL USERS
 * ============================================
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
 * ============================================
 * GET USER BY ID
 * ============================================
 */
export const getUserById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  const user = await UserService.getUserById(id);

  res.status(200).json({
    success: true,
    message: 'User retrieved successfully',
    data: user,
  });
};

/**
 * ============================================
 * UPDATE USER BY ID
 * ============================================
 */
export const updateUserById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  const data = req.body;

  const updatedUser = await UserService.updateUserById(id, data);

  res.status(200).json({
    success: true,
    message: `User ${id} updated successfully`,
    data: updatedUser,
  });
};

/**
 * ============================================
 * DELETE USER BY ID
 * ============================================
 */
export const deleteUserById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  const deletedUser = await UserService.deleteUserById(id);

  res.status(200).json({
    success: true,
    message: `User ${id} deleted successfully`,
    data: deletedUser,
  });
};
