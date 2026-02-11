import { HttpStatus, Injectable } from '@nestjs/common';
import { DriverRepository } from '../../repositories/driver.repository';
import { DriversValidator } from './drivers.validator';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { QueryDriversDto } from './dto/query-drivers.dto';
import {
  generateErrorResponse,
  generateSuccessResponse,
  throwError,
} from '../../utils/utils';
import { CaughtError } from '../../utils/entities/utils.entity';
import { logError } from '../../utils/logger';

@Injectable()
export class DriversService {
  constructor(
    private readonly driverRepository: DriverRepository,
    private readonly driversValidator: DriversValidator,
  ) {}

  async create(dto: CreateDriverDto): Promise<any> {
    try {
      await this.driversValidator.validateCreateDriver(dto);

      const driver = await this.driverRepository.create({
        fullName: dto.fullName,
        phoneNumber: dto.phoneNumber,
        licenseNumber: dto.licenseNumber,
        status: dto.status || 'ACTIVE',
      });

      return generateSuccessResponse({
        statusCode: HttpStatus.CREATED,
        message: 'Driver created successfully',
        data: driver,
      });
    } catch (error) {
      logError(`create driver: ${error}`);
      return generateErrorResponse(error as CaughtError);
    }
  }

  async findAll(query: QueryDriversDto): Promise<any> {
    try {
      this.driversValidator.validateQueryDrivers(query);

      const { page = 1, limit = 10, status } = query;
      const skip = (page - 1) * limit;

      const where = status ? { status } : {};

      const [drivers, total] = await Promise.all([
        this.driverRepository.findMany({ skip, take: limit, where }),
        this.driverRepository.count(where),
      ]);

      return generateSuccessResponse({
        statusCode: HttpStatus.OK,
        message: 'Drivers retrieved successfully',
        data: {
          drivers,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      logError(`find all drivers: ${error}`);
      return generateErrorResponse(error as CaughtError);
    }
  }

  async findOne(id: string): Promise<any> {
    try {
      const driver = await this.driverRepository.findById(id);
      if (!driver) {
        throwError('Driver not found', HttpStatus.NOT_FOUND);
      }

      return generateSuccessResponse({
        statusCode: HttpStatus.OK,
        message: 'Driver retrieved successfully',
        data: driver,
      });
    } catch (error) {
      logError(`find driver ${id}: ${error}`);
      return generateErrorResponse(error as CaughtError);
    }
  }

  async update(id: string, dto: UpdateDriverDto): Promise<any> {
    try {
      const driver = await this.driverRepository.findById(id);
      if (!driver) {
        throwError('Driver not found', HttpStatus.NOT_FOUND);
      }

      await this.driversValidator.validateUpdateDriver(id, dto);

      const updated = await this.driverRepository.update({
        id,
        data: dto,
      });

      return generateSuccessResponse({
        statusCode: HttpStatus.OK,
        message: 'Driver updated successfully',
        data: updated,
      });
    } catch (error) {
      logError(`update driver ${id}: ${error}`);
      return generateErrorResponse(error as CaughtError);
    }
  }

  async remove(id: string): Promise<any> {
    try {
      const driver = await this.driverRepository.findById(id);
      if (!driver) {
        throwError('Driver not found', HttpStatus.NOT_FOUND);
      }

      await this.driversValidator.validateDeleteDriver(id);
      await this.driverRepository.softDelete(id);

      return generateSuccessResponse({
        statusCode: HttpStatus.OK,
        message: 'Driver deactivated successfully',
        data: null,
      });
    } catch (error) {
      logError(`delete driver ${id}: ${error}`);
      return generateErrorResponse(error as CaughtError);
    }
  }
}
