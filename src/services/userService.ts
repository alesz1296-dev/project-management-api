import { prisma } from '../lib/prisma';

export class UserService {
  static async getAllUsers() {
    const users = await prisma.user.findMany({
      // .select() = choose which fields to return
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        createdAt: true,
      },
    });
    return users;
  }

  static async getUserById(id: number) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        createdAt: true,
      },
    });

    // If user doesn't exists
    if (!user) {
      throw new Error('User not found.');
    }

    return user;
  }

  static async updateUserById(id: number, data: any) {
    const updatedUser = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        createdAt: true,
      },
    });
    //returns User object if success
    return updatedUser;
  }

  static async deleteUserById(id: number) {
    const deletedUser = await prisma.user.delete({
      where: { id },
    });

    return deletedUser;
  }
}
