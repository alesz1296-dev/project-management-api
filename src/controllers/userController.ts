import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { TokenService } from '../services/tokenService';

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

  // user is the object directly, not wrapped
  const tokens = await TokenService.generateTokens(user.id, user.email);

  res.status(201).json({
    success: true,
    message: 'User registered successfully.',
    data: {
      user,
      tokens,
    },
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

  // Extract user from result
  const tokens = await TokenService.generateTokens(
    result.user.id,
    result.user.email
  );

  res.status(200).json({
    success: true,
    message: 'Login successful.',
    data: {
      user: result.user,
      tokens,
    },
  });
};

/**
 * ============================================
 * REFRESH ACCESS TOKEN
 * ============================================
 */
export const refreshAccessToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new Error('Refresh token is required');
  }

  // Verify refresh token - returns id, email, and jwtToken
  const { jwtToken } = await TokenService.verifyRefreshToken(refreshToken);

  res.status(200).json({
    success: true,
    message: 'Access token refreshed successfully.',
    data: {
      jwtToken,
    },
  });
};

/**
 * ============================================
 * LOGOUT USER
 * ============================================
 */
export const logoutUser = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new Error('Refresh token is required');
  }

  // Revoke the refresh token
  await TokenService.revokeRefreshToken(refreshToken);

  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};

/**
 * ============================================
 * LOGOUT FROM ALL DEVICES
 * ============================================
 */
export const logoutAllDevices = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id; // From auth middleware

  if (!userId) {
    throw new Error('User ID is required');
  }

  // Revoke all tokens for this user
  const result = await TokenService.revokeAllUserTokens(userId);

  res.status(200).json({
    success: true,
    message: `Logged out from ${result.revokedCount} device(s).`,
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
