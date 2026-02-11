import { Injectable, HttpStatus } from '@nestjs/common';
import * as joi from 'joi';
import { validateJoiSchema } from '../../utils/joi.validator';
import { throwError } from '../../utils/utils';
import { DriverRepository } from '../../repositories/driver.repository';
import { VehicleRepository } from '../../repositories/vehicle.repository';
import { AssignmentRepository } from '../../repositories/assignment.repository';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { QueryAssignmentsDto } from './dto/query-assignments.dto';

@Injectable()
export class AssignmentsValidator {
  constructor(
    private readonly driverRepository: DriverRepository,
    private readonly vehicleRepository: VehicleRepository,
    private readonly assignmentRepository: AssignmentRepository,
  ) {}

  async validateCreateAssignment(dto: CreateAssignmentDto): Promise<void> {
    // Joi schema validation
    const joiSchema = joi
      .object({
        driverId: joi.string().uuid().required().label('Driver ID'),
        vehicleId: joi.string().uuid().required().label('Vehicle ID'),
      })
      .strict();

    const results = validateJoiSchema(joiSchema, dto);
    if (results) throwError(results, HttpStatus.BAD_REQUEST);

    // Check driver exists and is active
    const driver = await this.driverRepository.findById(dto.driverId);
    if (!driver) {
      throwError('Driver not found', HttpStatus.NOT_FOUND);
    }
    if (driver.status !== 'ACTIVE') {
      throwError('Driver is not active', HttpStatus.BAD_REQUEST);
    }

    // Check vehicle exists
    const vehicle = await this.vehicleRepository.findById(dto.vehicleId);
    if (!vehicle) {
      throwError('Vehicle not found', HttpStatus.NOT_FOUND);
    }

    // Check driver doesn't have active assignment
    const driverAssignment =
      await this.assignmentRepository.findActiveByDriverId(dto.driverId);
    if (driverAssignment) {
      throwError(
        'Driver already has an active vehicle assignment',
        HttpStatus.CONFLICT,
      );
    }

    // Check vehicle doesn't have active assignment
    const vehicleAssignment =
      await this.assignmentRepository.findActiveByVehicleId(dto.vehicleId);
    if (vehicleAssignment) {
      throwError(
        'Vehicle is already assigned to another driver',
        HttpStatus.CONFLICT,
      );
    }
  }

  validateQueryAssignments(query: QueryAssignmentsDto): void {
    const joiSchema = joi
      .object({
        driverId: joi.string().uuid().optional().label('Driver ID'),
        vehicleId: joi.string().uuid().optional().label('Vehicle ID'),
        activeOnly: joi.boolean().optional().label('Active only'),
        page: joi.number().integer().min(1).optional().label('Page'),
        limit: joi.number().integer().min(1).max(100).optional().label('Limit'),
      })
      .strict();

    const results = validateJoiSchema(joiSchema, query);
    if (results) throwError(results, HttpStatus.BAD_REQUEST);
  }
}
