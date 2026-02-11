import { Injectable } from '@nestjs/common';
import prisma from '../common/prisma';
import {
  CreateUserData,
  UpdateUserParams,
  FindManyUsersParams,
} from './entities/user.entity';

@Injectable()
export class UserRepository {
  /**
   * Find user by email
   */
  async findByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Find user by ID
   */
  async findById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Create a new user
   */
  async create(data: CreateUserData) {
    return await prisma.user.create({
      data,
    });
  }

  /**
   * Update user by ID
   */
  async update(params: UpdateUserParams) {
    const { id, data } = params;
    return await prisma.user.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete user by ID
   */
  async delete(id: string) {
    return await prisma.user.delete({
      where: { id },
    });
  }

  /**
   * Get all users with pagination (excludes password for security)
   */
  async findMany(params?: FindManyUsersParams) {
    return await prisma.user.findMany({
      ...params,
      select: {
        id: true,
        email: true,
        fullName: true,
        phoneNumber: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        // password explicitly omitted
      },
    });
  }

  /**
   * Count users
   */
  async count(where?: FindManyUsersParams['where']) {
    return await prisma.user.count({ where });
  }
}
