import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { DriversService } from '../drivers.service';
import { DriverRepository } from '../../../repositories/driver.repository';
import { DriversValidator } from '../drivers.validator';
import { AssignmentRepository } from '../../../repositories/assignment.repository';

describe('DriversService', () => {
    let service: DriversService;
    let driverRepository: jest.Mocked<DriverRepository>;
    let driversValidator: jest.Mocked<DriversValidator>;

    const mockDriver = {
        id: 'driver-1',
        fullName: 'John Doe',
        phoneNumber: '+254712345678',
        licenseNumber: 'DL123456789',
        status: 'ACTIVE' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
    };

    beforeEach(async () => {
        const mockDriverRepository = {
            create: jest.fn(),
            findById: jest.fn(),
            findMany: jest.fn(),
            count: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
            findByPhoneNumber: jest.fn(),
            findByLicenseNumber: jest.fn(),
        };

        const mockAssignmentRepository = {
            findActiveByDriverId: jest.fn(),
            findActiveByVehicleId: jest.fn(),
        };

        const mockDriversValidator = {
            validateCreateDriver: jest.fn(),
            validateUpdateDriver: jest.fn(),
            validateQueryDrivers: jest.fn(),
            validateDeleteDriver: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DriversService,
                { provide: DriverRepository, useValue: mockDriverRepository },
                { provide: DriversValidator, useValue: mockDriversValidator },
                { provide: AssignmentRepository, useValue: mockAssignmentRepository },
            ],
        }).compile();

        service = module.get<DriversService>(DriversService);
        driverRepository = module.get(DriverRepository);
        driversValidator = module.get(DriversValidator);
    });

    describe('create', () => {
        it('should create a driver successfully', async () => {
            driversValidator.validateCreateDriver.mockResolvedValue(undefined);
            driverRepository.create.mockResolvedValue(mockDriver);

            const result = await service.create({
                fullName: 'John Doe',
                phoneNumber: '+254712345678',
                licenseNumber: 'DL123456789',
            });

            expect(result.status).toBe(HttpStatus.CREATED);
            expect(result.message).toBe('Driver created successfully');
            expect(result.data).toEqual(mockDriver);
        });

        it('should return error for duplicate phone number', async () => {
            const error = new Error('Phone number already registered') as Error & { code?: number };
            error.code = HttpStatus.CONFLICT;
            driversValidator.validateCreateDriver.mockRejectedValue(error);

            const result = await service.create({
                fullName: 'John Doe',
                phoneNumber: '+254712345678',
                licenseNumber: 'DL999999999',
            });

            expect(result.status).toBe(HttpStatus.CONFLICT);
        });
    });

    describe('findAll', () => {
        it('should return paginated drivers', async () => {
            driverRepository.findMany.mockResolvedValue([mockDriver]);
            driverRepository.count.mockResolvedValue(1);

            const result = await service.findAll({ page: 1, limit: 10 });

            expect(result.status).toBe(HttpStatus.OK);
            expect(result.message).toBe('Drivers retrieved successfully');
            expect(result.data.drivers).toHaveLength(1);
            expect(result.data.pagination).toEqual({
                page: 1,
                limit: 10,
                total: 1,
                totalPages: 1,
            });
        });

        it('should filter by status', async () => {
            driverRepository.findMany.mockResolvedValue([mockDriver]);
            driverRepository.count.mockResolvedValue(1);

            await service.findAll({ page: 1, limit: 10, status: 'ACTIVE' });

            expect(driverRepository.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { status: 'ACTIVE' },
                }),
            );
        });
    });

    describe('findOne', () => {
        it('should return a driver by ID', async () => {
            driverRepository.findById.mockResolvedValue(mockDriver);

            const result = await service.findOne('driver-1');

            expect(result.status).toBe(HttpStatus.OK);
            expect(result.data).toEqual(mockDriver);
        });

        it('should return 404 for non-existent driver', async () => {
            driverRepository.findById.mockResolvedValue(null);

            const result = await service.findOne('non-existent');

            expect(result.status).toBe(HttpStatus.NOT_FOUND);
        });
    });

    describe('update', () => {
        it('should update a driver', async () => {
            const updatedDriver = { ...mockDriver, fullName: 'Jane Doe' };
            driverRepository.findById.mockResolvedValue(mockDriver);
            driversValidator.validateUpdateDriver.mockResolvedValue(undefined);
            driverRepository.update.mockResolvedValue(updatedDriver);

            const result = await service.update('driver-1', { fullName: 'Jane Doe' });

            expect(result.status).toBe(HttpStatus.OK);
            expect(result.data.fullName).toBe('Jane Doe');
        });

        it('should return 404 when updating non-existent driver', async () => {
            driverRepository.findById.mockResolvedValue(null);

            const result = await service.update('non-existent', {
                fullName: 'Jane Doe',
            });

            expect(result.status).toBe(HttpStatus.NOT_FOUND);
        });
    });

    describe('remove (soft-delete)', () => {
        it('should deactivate a driver', async () => {
            driverRepository.findById.mockResolvedValue(mockDriver);
            driversValidator.validateDeleteDriver.mockResolvedValue(undefined);
            driverRepository.softDelete.mockResolvedValue({
                ...mockDriver,
                deletedAt: new Date(),
                status: 'INACTIVE',
            });

            const result = await service.remove('driver-1');

            expect(result.status).toBe(HttpStatus.OK);
            expect(result.message).toBe('Driver deactivated successfully');
        });

        it('should return 404 when removing non-existent driver', async () => {
            driverRepository.findById.mockResolvedValue(null);

            const result = await service.remove('non-existent');

            expect(result.status).toBe(HttpStatus.NOT_FOUND);
        });
    });
});
