import { Injectable, HttpStatus } from '@nestjs/common';
import * as joi from 'joi';
import { validateJoiSchema } from '../../utils/joi.validator';
import { throwError } from '../../utils/utils';
import { DriverRepository } from '../../repositories/driver.repository';
import { AssignmentRepository } from '../../repositories/assignment.repository';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { QueryDriversDto } from './dto/query-drivers.dto';

@Injectable()
export class DriversValidator {
  constructor(
    private readonly driverRepository: DriverRepository,
    private readonly assignmentRepository: AssignmentRepository,
  ) {}

  async validateCreateDriver(dto: CreateDriverDto): Promise<void> {
    // Joi schema validation
    const joiSchema = joi
      .object({
        fullName: joi.string().required().label('Full name'),
        phoneNumber: joi
          .string()
          .pattern(/^\+?[0-9]\d{9,14}$/)
          .required()
          .label('Phone number'),
        licenseNumber: joi.string().min(5).required().label('License number'),
        status: joi
          .string()
          .valid('ACTIVE', 'SUSPENDED', 'INACTIVE')
          .optional()
          .label('Status'),
      })
      .strict();

    const results = validateJoiSchema(joiSchema, dto);
    if (results) throwError(results, HttpStatus.BAD_REQUEST);

    // Check phone number uniqueness
    const existingByPhone = await this.driverRepository.findByPhoneNumber(
      dto.phoneNumber,
    );
    if (existingByPhone) {
      throwError('Phone number already registered', HttpStatus.CONFLICT);
    }

    // Check license number uniqueness
    const existingByLicense = await this.driverRepository.findByLicenseNumber(
      dto.licenseNumber,
    );
    if (existingByLicense) {
      throwError('License number already registered', HttpStatus.CONFLICT);
    }
  }

  async validateUpdateDriver(id: string, dto: UpdateDriverDto): Promise<void> {
    // Joi schema validation
    const joiSchema = joi
      .object({
        fullName: joi.string().optional().label('Full name'),
        phoneNumber: joi
          .string()
          .pattern(/^\+?[0-9]\d{9,14}$/)
          .optional()
          .label('Phone number'),
        licenseNumber: joi.string().min(5).optional().label('License number'),
        status: joi
          .string()
          .valid('ACTIVE', 'SUSPENDED', 'INACTIVE')
          .optional()
          .label('Status'),
      })
      .strict();

    const results = validateJoiSchema(joiSchema, dto);
    if (results) throwError(results, HttpStatus.BAD_REQUEST);

    // Check phone number uniqueness (if changed)
    if (dto.phoneNumber) {
      const existingByPhone = await this.driverRepository.findByPhoneNumber(
        dto.phoneNumber,
      );
      if (existingByPhone && existingByPhone.id !== id) {
        throwError('Phone number already registered', HttpStatus.CONFLICT);
      }
    }

    // Check license number uniqueness (if changed)
    if (dto.licenseNumber) {
      const existingByLicense = await this.driverRepository.findByLicenseNumber(
        dto.licenseNumber,
      );
      if (existingByLicense && existingByLicense.id !== id) {
        throwError('License number already registered', HttpStatus.CONFLICT);
      }
    }
  }

  validateQueryDrivers(query: QueryDriversDto): void {
    const joiSchema = joi
      .object({
        status: joi
          .string()
          .valid('ACTIVE', 'SUSPENDED', 'INACTIVE')
          .optional()
          .label('Status'),
        page: joi.number().integer().min(1).optional().label('Page'),
        limit: joi.number().integer().min(1).max(100).optional().label('Limit'),
      })
      .strict();

    const results = validateJoiSchema(joiSchema, query);
    if (results) throwError(results, HttpStatus.BAD_REQUEST);
  }

  async validateDeleteDriver(id: string): Promise<void> {
    // Check if driver has active assignment
    const activeAssignment =
      await this.assignmentRepository.findActiveByDriverId(id);
    if (activeAssignment) {
      throwError(
        'Cannot delete driver with active vehicle assignment',
        HttpStatus.CONFLICT,
      );
    }
  }
}
