import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { VehiclesService } from '../vehicles.service';
import { VehicleRepository } from '../../../repositories/vehicle.repository';
import { VehiclesValidator } from '../vehicles.validator';

describe('VehiclesService', () => {
    let service: VehiclesService;
    let vehicleRepository: jest.Mocked<VehicleRepository>;
    let vehiclesValidator: jest.Mocked<VehiclesValidator>;

    const mockVehicle = {
        id: 'vehicle-1',
        registrationNumber: 'KAA 001A',
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
    };

    beforeEach(async () => {
        const mockVehicleRepository = {
            create: jest.fn(),
            findById: jest.fn(),
            findMany: jest.fn(),
            count: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
        };

        const mockVehiclesValidator = {
            validateCreateVehicle: jest.fn(),
            validateQueryVehicles: jest.fn(),
            validateUpdateVehicle: jest.fn(),
            validateDeleteVehicle: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                VehiclesService,
                { provide: VehicleRepository, useValue: mockVehicleRepository },
                { provide: VehiclesValidator, useValue: mockVehiclesValidator },
            ],
        }).compile();

        service = module.get<VehiclesService>(VehiclesService);
        vehicleRepository = module.get(VehicleRepository);
        vehiclesValidator = module.get(VehiclesValidator);
    });

    describe('create', () => {
        it('should create a vehicle', async () => {
            vehiclesValidator.validateCreateVehicle.mockResolvedValue(undefined);
            vehicleRepository.create.mockResolvedValue(mockVehicle as any);

            const result = await service.create({ registrationNumber: 'KAA 001A' });

            expect(result.status).toBe(HttpStatus.CREATED);
            expect(result.data.registrationNumber).toBe('KAA 001A');
        });
    });

    describe('findAll', () => {
        it('should return paginated vehicles', async () => {
            vehicleRepository.findMany.mockResolvedValue([mockVehicle] as any);
            vehicleRepository.count.mockResolvedValue(1);

            const result = await service.findAll({ page: 1, limit: 10 });

            expect(result.status).toBe(HttpStatus.OK);
            expect(result.data.vehicles).toHaveLength(1);
        });
    });

    describe('findOne', () => {
        it('should return vehicle by ID', async () => {
            vehicleRepository.findById.mockResolvedValue(mockVehicle as any);

            const result = await service.findOne('vehicle-1');

            expect(result.status).toBe(HttpStatus.OK);
            expect(result.data.id).toBe('vehicle-1');
        });

        it('should return 404 for missing vehicle', async () => {
            vehicleRepository.findById.mockResolvedValue(null);

            const result = await service.findOne('none');

            expect(result.status).toBe(HttpStatus.NOT_FOUND);
        });
    });

    describe('update', () => {
        it('should update vehicle', async () => {
            vehicleRepository.findById.mockResolvedValue(mockVehicle as any);
            vehicleRepository.update.mockResolvedValue({ ...mockVehicle, registrationNumber: 'NEW-REG' } as any);

            const result = await service.update('vehicle-1', { registrationNumber: 'NEW-REG' });

            expect(result.status).toBe(HttpStatus.OK);
            expect(result.data.registrationNumber).toBe('NEW-REG');
        });
    });

    describe('remove', () => {
        it('should deactivate vehicle', async () => {
            vehicleRepository.findById.mockResolvedValue(mockVehicle as any);

            const result = await service.remove('vehicle-1');

            expect(result.status).toBe(HttpStatus.OK);
        });
    });
});
