import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  logoutAllDevices,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
} from '../userController';
import { UserService } from '../../services/userService';
import { TokenService } from '../../services/tokenService';

jest.mock('../../services/userService');
jest.mock('../../services/tokenService');

describe('UserController', () => {
  let mockReq: any;
  let mockRes: any;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockJson = jest.fn().mockReturnThis();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockRes = { status: mockStatus, json: mockJson };
    mockReq = { body: {}, params: {}, user: { id: 1 } };
  });

  /**
   * ============================================
   * registerUser - Success
   * ============================================
   */
  test('registerUser should register user and return tokens', async () => {
    const mockUser = {
      id: 1,
      email: 'newuser@example.com',
      firstName: 'John',
      lastName: 'Doe',
      avatar: null,
    };

    const mockTokens = {
      jwtToken: 'jwt_token_123',
      refreshToken: 'refresh_token_456',
    };

    mockReq.body = {
      email: 'newuser@example.com',
      password: 'Password123!',
      firstName: 'John',
      lastName: 'Doe',
    };

    (UserService.registerUser as jest.Mock).mockResolvedValueOnce(mockUser);
    (TokenService.generateTokens as jest.Mock).mockResolvedValueOnce(
      mockTokens
    );

    await registerUser(mockReq, mockRes);

    expect(UserService.registerUser).toHaveBeenCalledWith({
      email: 'newuser@example.com',
      password: 'Password123!',
      firstName: 'John',
      lastName: 'Doe',
    });

    expect(TokenService.generateTokens).toHaveBeenCalledWith(
      1,
      'newuser@example.com'
    );
    expect(mockStatus).toHaveBeenCalledWith(201);
    expect(mockJson).toHaveBeenCalledWith({
      success: true,
      message: 'User registered successfully.',
      data: { user: mockUser, tokens: mockTokens },
    });
  });

  /**
   * ============================================
   * registerUser - Email Already Exists
   * ============================================
   */
  test('registerUser should throw error if email exists', async () => {
    mockReq.body = {
      email: 'existing@example.com',
      password: 'Password123!',
      firstName: 'John',
      lastName: 'Doe',
    };

    (UserService.registerUser as jest.Mock).mockRejectedValueOnce(
      new Error('User with this email already exists.')
    );

    await expect(registerUser(mockReq, mockRes)).rejects.toThrow(
      'User with this email already exists.'
    );
  });

  /**
   * ============================================
   * loginUser - Success
   * ============================================
   */
  test('loginUser should login user and return tokens', async () => {
    const mockUser = {
      id: 1,
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      avatar: null,
    };

    const mockTokens = {
      jwtToken: 'jwt_token_123',
      refreshToken: 'refresh_token_456',
    };

    mockReq.body = {
      email: 'user@example.com',
      password: 'Password123!',
    };

    (UserService.loginUser as jest.Mock).mockResolvedValueOnce({
      user: mockUser,
    });
    (TokenService.generateTokens as jest.Mock).mockResolvedValueOnce(
      mockTokens
    );

    await loginUser(mockReq, mockRes);

    expect(UserService.loginUser).toHaveBeenCalledWith(
      'user@example.com',
      'Password123!'
    );
    expect(TokenService.generateTokens).toHaveBeenCalledWith(
      1,
      'user@example.com'
    );
    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith({
      success: true,
      message: 'Login successful.',
      data: { user: mockUser, tokens: mockTokens },
    });
  });

  /**
   * ============================================
   * loginUser - Invalid Credentials
   * ============================================
   */
  test('loginUser should throw error if credentials invalid', async () => {
    mockReq.body = {
      email: 'user@example.com',
      password: 'WrongPassword',
    };

    (UserService.loginUser as jest.Mock).mockRejectedValueOnce(
      new Error('Invalid email or password.')
    );

    await expect(loginUser(mockReq, mockRes)).rejects.toThrow(
      'Invalid email or password.'
    );
  });

  /**
   * ============================================
   * refreshAccessToken - Success
   * ============================================
   */
  test('refreshAccessToken should return new JWT', async () => {
    mockReq.body = { refreshToken: 'valid_refresh_token' };

    (TokenService.verifyRefreshToken as jest.Mock).mockResolvedValueOnce({
      id: 1,
      email: 'user@example.com',
      jwtToken: 'new_jwt_token_123',
    });

    await refreshAccessToken(mockReq, mockRes);

    expect(TokenService.verifyRefreshToken).toHaveBeenCalledWith(
      'valid_refresh_token'
    );
    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith({
      success: true,
      message: 'Access token refreshed successfully.',
      data: { jwtToken: 'new_jwt_token_123' },
    });
  });

  /**
   * ============================================
   * refreshAccessToken - Missing Token
   * ============================================
   */
  test('refreshAccessToken should throw error if token missing', async () => {
    mockReq.body = {};

    await expect(refreshAccessToken(mockReq, mockRes)).rejects.toThrow(
      'Refresh token is required'
    );
  });

  /**
   * ============================================
   * refreshAccessToken - Invalid Token
   * ============================================
   */
  test('refreshAccessToken should throw error if token invalid', async () => {
    mockReq.body = { refreshToken: 'invalid_token' };

    (TokenService.verifyRefreshToken as jest.Mock).mockRejectedValueOnce(
      new Error('Invalid refresh token')
    );

    await expect(refreshAccessToken(mockReq, mockRes)).rejects.toThrow(
      'Invalid refresh token'
    );
  });

  /**
   * ============================================
   * logoutUser - Success
   * ============================================
   */
  test('logoutUser should revoke refresh token', async () => {
    mockReq.body = { refreshToken: 'valid_refresh_token' };

    (TokenService.revokeRefreshToken as jest.Mock).mockResolvedValueOnce({
      success: true,
    });

    await logoutUser(mockReq, mockRes);

    expect(TokenService.revokeRefreshToken).toHaveBeenCalledWith(
      'valid_refresh_token'
    );
    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith({
      success: true,
      message: 'Logged out successfully.',
    });
  });

  /**
   * ============================================
   * logoutUser - Missing Token
   * ============================================
   */
  test('logoutUser should throw error if token missing', async () => {
    mockReq.body = {};

    await expect(logoutUser(mockReq, mockRes)).rejects.toThrow(
      'Refresh token is required'
    );
  });

  /**
   * ============================================
   * logoutAllDevices - Success
   * ============================================
   */
  test('logoutAllDevices should revoke all user tokens', async () => {
    mockReq.user = { id: 1 };

    (TokenService.revokeAllUserTokens as jest.Mock).mockResolvedValueOnce({
      success: true,
      revokedCount: 3,
    });

    await logoutAllDevices(mockReq, mockRes);

    expect(TokenService.revokeAllUserTokens).toHaveBeenCalledWith(1);
    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith({
      success: true,
      message: 'Logged out from 3 device(s).',
      data: { success: true, revokedCount: 3 },
    });
  });

  /**
   * ============================================
   * logoutAllDevices - Missing User ID
   * ============================================
   */
  test('logoutAllDevices should throw error if user ID missing', async () => {
    mockReq.user = undefined;

    await expect(logoutAllDevices(mockReq, mockRes)).rejects.toThrow(
      'User ID is required'
    );
  });

  /**
   * ============================================
   * getAllUsers - Success
   * ============================================
   */
  test('getAllUsers should return all users', async () => {
    const mockUsers = [
      {
        id: 1,
        email: 'user1@example.com',
        firstName: 'John',
        lastName: 'Doe',
        avatar: null,
      },
      {
        id: 2,
        email: 'user2@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        avatar: null,
      },
    ];

    (UserService.getAllUsers as jest.Mock).mockResolvedValueOnce(mockUsers);

    await getAllUsers(mockReq, mockRes);

    expect(UserService.getAllUsers).toHaveBeenCalled();
    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith({
      success: true,
      message: 'Users retrieved successfully',
      data: mockUsers,
    });
  });

  /**
   * ============================================
   * getAllUsers - Empty Array
   * ============================================
   */
  test('getAllUsers should return empty array if no users', async () => {
    (UserService.getAllUsers as jest.Mock).mockResolvedValueOnce([]);

    await getAllUsers(mockReq, mockRes);

    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith({
      success: true,
      message: 'Users retrieved successfully',
      data: [],
    });
  });

  /**
   * ============================================
   * getUserById - Success
   * ============================================
   */
  test('getUserById should return user by id', async () => {
    const mockUser = {
      id: 1,
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      avatar: null,
    };

    mockReq.params = { id: '1' };

    (UserService.getUserById as jest.Mock).mockResolvedValueOnce(mockUser);

    await getUserById(mockReq, mockRes);

    expect(UserService.getUserById).toHaveBeenCalledWith(1);
    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith({
      success: true,
      message: 'User retrieved successfully',
      data: mockUser,
    });
  });

  /**
   * ============================================
   * getUserById - Not Found
   * ============================================
   */
  test('getUserById should throw error if user not found', async () => {
    mockReq.params = { id: '999' };

    (UserService.getUserById as jest.Mock).mockRejectedValueOnce(
      new Error('User not found.')
    );

    await expect(getUserById(mockReq, mockRes)).rejects.toThrow(
      'User not found.'
    );
  });

  /**
   * ============================================
   * updateUserById - Success
   * ============================================
   */
  test('updateUserById should update user', async () => {
    const mockUpdatedUser = {
      id: 1,
      email: 'user@example.com',
      firstName: 'Jane',
      lastName: 'Updated',
      avatar: null,
    };

    mockReq.params = { id: '1' };
    mockReq.body = { firstName: 'Jane', lastName: 'Updated' };

    (UserService.updateUserById as jest.Mock).mockResolvedValueOnce(
      mockUpdatedUser
    );

    await updateUserById(mockReq, mockRes);

    expect(UserService.updateUserById).toHaveBeenCalledWith(1, {
      firstName: 'Jane',
      lastName: 'Updated',
    });
    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith({
      success: true,
      message: 'User 1 updated successfully',
      data: mockUpdatedUser,
    });
  });

  /**
   * ============================================
   * updateUserById - Not Found
   * ============================================
   */
  test('updateUserById should throw error if user not found', async () => {
    mockReq.params = { id: '999' };
    mockReq.body = { firstName: 'John' };

    (UserService.updateUserById as jest.Mock).mockRejectedValueOnce(
      new Error('User not found.')
    );

    await expect(updateUserById(mockReq, mockRes)).rejects.toThrow(
      'User not found.'
    );
  });

  /**
   * ============================================
   * deleteUserById - Success
   * ============================================
   */
  test('deleteUserById should delete user', async () => {
    const mockDeletedUser = {
      id: 1,
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      avatar: null,
    };

    mockReq.params = { id: '1' };

    (UserService.deleteUserById as jest.Mock).mockResolvedValueOnce(
      mockDeletedUser
    );

    await deleteUserById(mockReq, mockRes);

    expect(UserService.deleteUserById).toHaveBeenCalledWith(1);
    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith({
      success: true,
      message: 'User 1 deleted successfully',
      data: mockDeletedUser,
    });
  });

  /**
   * ============================================
   * deleteUserById - Not Found
   * ============================================
   */
  test('deleteUserById should throw error if user not found', async () => {
    mockReq.params = { id: '999' };

    (UserService.deleteUserById as jest.Mock).mockRejectedValueOnce(
      new Error('User not found.')
    );

    await expect(deleteUserById(mockReq, mockRes)).rejects.toThrow(
      'User not found.'
    );
  });
});
