import { HttpStatus, Injectable } from '@nestjs/common';
import { VehicleRepository } from '../../repositories/vehicle.repository';
import { VehiclesValidator } from './vehicles.validator';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { QueryVehiclesDto } from './dto/query-vehicles.dto';
import {
  generateErrorResponse,
  generateSuccessResponse,
  throwError,
} from '../../utils/utils';
import { CaughtError } from '../../utils/entities/utils.entity';
import { logError } from '../../utils/logger';

@Injectable()
export class VehiclesService {
  constructor(
    private readonly vehicleRepository: VehicleRepository,
    private readonly vehiclesValidator: VehiclesValidator,
  ) {}

  async create(dto: CreateVehicleDto): Promise<any> {
    try {
      await this.vehiclesValidator.validateCreateVehicle(dto);

      const vehicle = await this.vehicleRepository.create({
        registrationNumber: dto.registrationNumber,
      });

      return generateSuccessResponse({
        statusCode: HttpStatus.CREATED,
        message: 'Vehicle created successfully',
        data: vehicle,
      });
    } catch (error) {
      logError(`create vehicle: ${error} `);
      return generateErrorResponse(error as CaughtError);
    }
  }

  async findAll(query: QueryVehiclesDto): Promise<any> {
    try {
      this.vehiclesValidator.validateQueryVehicles(query);

      const { page = 1, limit = 10 } = query;
      const skip = (page - 1) * limit;

      const [vehicles, total] = await Promise.all([
        this.vehicleRepository.findMany({ skip, take: limit }),
        this.vehicleRepository.count(),
      ]);

      return generateSuccessResponse({
        statusCode: HttpStatus.OK,
        message: 'Vehicles retrieved successfully',
        data: {
          vehicles,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      logError(`find all vehicles: ${error} `);
      return generateErrorResponse(error as CaughtError);
    }
  }

  async findOne(id: string): Promise<any> {
    try {
      const vehicle = await this.vehicleRepository.findById(id);

      if (!vehicle) {
        throwError('Vehicle not found', HttpStatus.NOT_FOUND);
      }

      return generateSuccessResponse({
        statusCode: HttpStatus.OK,
        message: 'Vehicle retrieved successfully',
        data: vehicle,
      });
    } catch (error) {
      logError(`find vehicle ${id}: ${error} `);
      return generateErrorResponse(error as CaughtError);
    }
  }

  async update(id: string, dto: UpdateVehicleDto): Promise<any> {
    try {
      const vehicle = await this.vehicleRepository.findById(id);
      if (!vehicle) {
        throwError('Vehicle not found', HttpStatus.NOT_FOUND);
      }

      await this.vehiclesValidator.validateUpdateVehicle(id, dto);

      const updated = await this.vehicleRepository.update({
        id,
        data: dto,
      });

      return generateSuccessResponse({
        statusCode: HttpStatus.OK,
        message: 'Vehicle updated successfully',
        data: updated,
      });
    } catch (error) {
      logError(`update vehicle ${id}: ${error} `);
      return generateErrorResponse(error as CaughtError);
    }
  }

  async remove(id: string): Promise<any> {
    try {
      const vehicle = await this.vehicleRepository.findById(id);
      if (!vehicle) {
        throwError('Vehicle not found', HttpStatus.NOT_FOUND);
      }

      await this.vehiclesValidator.validateDeleteVehicle(id);
      await this.vehicleRepository.softDelete(id);

      return generateSuccessResponse({
        statusCode: HttpStatus.OK,
        message: 'Vehicle deactivated successfully',
        data: null,
      });
    } catch (error) {
      logError(`delete vehicle ${id}: ${error} `);
      return generateErrorResponse(error as CaughtError);
    }
  }
}
