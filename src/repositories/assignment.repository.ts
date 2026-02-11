import { Injectable } from '@nestjs/common';
import prisma from '../common/prisma';
import type {
  CreateAssignmentData,
  FindManyAssignmentsParams,
} from './entities/assignment.entity';

@Injectable()
export class AssignmentRepository {
  /**
   * Find assignment by ID
   */
  async findById(id: string) {
    return await prisma.vehicleAssignment.findUnique({
      where: { id },
      include: {
        driver: true,
        vehicle: true,
      },
    });
  }

  /**
   * Find current active assignment for a driver
   */
  async findActiveByDriverId(driverId: string) {
    return await prisma.vehicleAssignment.findFirst({
      where: {
        driverId,
        unassignedAt: null,
      },
      include: {
        driver: true,
        vehicle: true,
      },
    });
  }

  /**
   * Find current active assignment for a vehicle
   */
  async findActiveByVehicleId(vehicleId: string) {
    return await prisma.vehicleAssignment.findFirst({
      where: {
        vehicleId,
        unassignedAt: null,
      },
      include: {
        driver: true,
        vehicle: true,
      },
    });
  }

  /**
   * Create a new assignment
   */
  async create(data: CreateAssignmentData) {
    return await prisma.vehicleAssignment.create({
      data,
      include: {
        driver: true,
        vehicle: true,
      },
    });
  }

  /**
   * Unassign (set unassignedAt timestamp)
   */
  async unassign(id: string) {
    return await prisma.vehicleAssignment.update({
      where: { id },
      data: { unassignedAt: new Date() },
      include: {
        driver: true,
        vehicle: true,
      },
    });
  }

  /**
   * Get all assignments with pagination
   */
  async findMany(params?: FindManyAssignmentsParams) {
    return await prisma.vehicleAssignment.findMany({
      ...params,
      include: params?.include || {
        driver: true,
        vehicle: true,
      },
    });
  }

  /**
   * Count assignments
   */
  async count(where?: FindManyAssignmentsParams['where']) {
    return await prisma.vehicleAssignment.count({ where });
  }
}
