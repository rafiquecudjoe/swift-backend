import { Injectable, HttpStatus } from '@nestjs/common';
import * as joi from 'joi';
import { validateJoiSchema } from '../../utils/joi.validator';
import { throwError } from '../../utils/utils';
import { VehicleRepository } from '../../repositories/vehicle.repository';
import { AssignmentRepository } from '../../repositories/assignment.repository';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { QueryVehiclesDto } from './dto/query-vehicles.dto';

@Injectable()
export class VehiclesValidator {
  constructor(
    private readonly vehicleRepository: VehicleRepository,
    private readonly assignmentRepository: AssignmentRepository,
  ) {}

  async validateCreateVehicle(dto: CreateVehicleDto): Promise<void> {
    const joiSchema = joi
      .object({
        registrationNumber: joi
          .string()
          .min(3)
          .required()
          .label('Registration number'),
      })
      .strict();

    const results = validateJoiSchema(joiSchema, dto);
    if (results) throwError(results, HttpStatus.BAD_REQUEST);

    // Check registration number uniqueness
    const existing = await this.vehicleRepository.findByRegistrationNumber(
      dto.registrationNumber,
    );
    if (existing) {
      throwError('Registration number already registered', HttpStatus.CONFLICT);
    }
  }

  async validateUpdateVehicle(
    id: string,
    dto: UpdateVehicleDto,
  ): Promise<void> {
    const joiSchema = joi
      .object({
        registrationNumber: joi
          .string()
          .min(3)
          .optional()
          .label('Registration number'),
      })
      .strict();

    const results = validateJoiSchema(joiSchema, dto);
    if (results) throwError(results, HttpStatus.BAD_REQUEST);

    // Check registration number uniqueness
    if (dto.registrationNumber) {
      const existing = await this.vehicleRepository.findByRegistrationNumber(
        dto.registrationNumber,
      );
      if (existing && existing.id !== id) {
        throwError(
          'Registration number already registered',
          HttpStatus.CONFLICT,
        );
      }
    }
  }

  validateQueryVehicles(query: QueryVehiclesDto): void {
    const joiSchema = joi
      .object({
        page: joi.number().integer().min(1).optional().label('Page'),
        limit: joi.number().integer().min(1).max(100).optional().label('Limit'),
      })
      .strict();

    const results = validateJoiSchema(joiSchema, query);
    if (results) throwError(results, HttpStatus.BAD_REQUEST);
  }

  async validateDeleteVehicle(id: string): Promise<void> {
    // Check if vehicle has active assignment
    const activeAssignment =
      await this.assignmentRepository.findActiveByVehicleId(id);
    if (activeAssignment) {
      throwError(
        'Cannot delete vehicle with active driver assignment',
        HttpStatus.CONFLICT,
      );
    }
  }
}
