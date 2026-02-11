import { Injectable } from '@nestjs/common';
import prisma from '../common/prisma';
import {
  CreateVehicleData,
  UpdateVehicleParams,
  FindManyVehiclesParams,
} from './entities/vehicle.entity';

@Injectable()
export class VehicleRepository {
  /**
   * Find vehicle by ID (excluding soft-deleted)
   */
  async findById(id: string) {
    return await prisma.vehicle.findFirst({
      where: { id, deletedAt: null },
    });
  }

  /**
   * Find vehicle by registration number
   */
  async findByRegistrationNumber(registrationNumber: string) {
    return await prisma.vehicle.findFirst({
      where: { registrationNumber, deletedAt: null },
    });
  }

  /**
   * Create a new vehicle
   */
  async create(data: CreateVehicleData) {
    return await prisma.vehicle.create({
      data,
    });
  }

  /**
   * Update vehicle by ID
   */
  async update(params: UpdateVehicleParams) {
    const { id, data } = params;
    return await prisma.vehicle.update({
      where: { id },
      data,
    });
  }

  /**
   * Soft delete vehicle
   */
  async softDelete(id: string) {
    return await prisma.vehicle.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Get all active vehicles with pagination
   */
  async findMany(params?: FindManyVehiclesParams) {
    return await prisma.vehicle.findMany({
      ...params,
      where: {
        ...params?.where,
        deletedAt: null,
      },
    });
  }

  /**
   * Count active vehicles
   */
  async count(where?: FindManyVehiclesParams['where']) {
    return await prisma.vehicle.count({
      where: {
        ...where,
        deletedAt: null,
      },
    });
  }
}
