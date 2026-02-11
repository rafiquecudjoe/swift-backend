import { Injectable } from '@nestjs/common';
import prisma from '../common/prisma';
import {
  CreateDriverData,
  UpdateDriverParams,
  FindManyDriversParams,
} from './entities/driver.entity';

@Injectable()
export class DriverRepository {
  /**
   * Find driver by ID (excluding soft-deleted)
   */
  async findById(id: string) {
    return await prisma.driver.findFirst({
      where: { id, deletedAt: null },
    });
  }

  /**
   * Find driver by phone number
   */
  async findByPhoneNumber(phoneNumber: string) {
    return await prisma.driver.findFirst({
      where: { phoneNumber, deletedAt: null },
    });
  }

  /**
   * Find driver by license number
   */
  async findByLicenseNumber(licenseNumber: string) {
    return await prisma.driver.findFirst({
      where: { licenseNumber, deletedAt: null },
    });
  }

  /**
   * Create a new driver
   */
  async create(data: CreateDriverData) {
    return await prisma.driver.create({
      data,
    });
  }

  /**
   * Update driver by ID
   */
  async update(params: UpdateDriverParams) {
    const { id, data } = params;
    return await prisma.driver.update({
      where: { id },
      data,
    });
  }

  /**
   * Soft delete driver (set deletedAt timestamp)
   */
  async softDelete(id: string) {
    return await prisma.driver.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'INACTIVE' },
    });
  }

  /**
   * Get all active drivers with pagination
   */
  async findMany(params?: FindManyDriversParams) {
    return await prisma.driver.findMany({
      ...params,
      where: {
        ...params?.where,
        deletedAt: null, // Always exclude soft-deleted
      },
    });
  }

  /**
   * Count active drivers
   */
  async count(where?: FindManyDriversParams['where']) {
    return await prisma.driver.count({
      where: {
        ...where,
        deletedAt: null,
      },
    });
  }
}
