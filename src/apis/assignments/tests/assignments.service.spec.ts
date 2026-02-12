/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { AssignmentsService } from '../assignments.service';
import { AssignmentRepository } from '../../../repositories/assignment.repository';
import { AssignmentsValidator } from '../assignments.validator';
import { DriverRepository } from '../../../repositories/driver.repository';
import { VehicleRepository } from '../../../repositories/vehicle.repository';
import { AuditLogService } from '../../../common/audit-log/audit-log.service';

describe('AssignmentsService', () => {
  let service: AssignmentsService;
  let assignmentRepository: jest.Mocked<AssignmentRepository>;
  let assignmentsValidator: jest.Mocked<AssignmentsValidator>;

  const mockAssignment = {
    id: 'assignment-1',
    driverId: 'driver-1',
    vehicleId: 'vehicle-1',
    assignedAt: new Date(),
    unassignedAt: null,
  };

  beforeEach(async () => {
    const mockAssignmentRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      unassign: jest.fn(),
      findActiveByDriverId: jest.fn(),
      findActiveByVehicleId: jest.fn(),
    };

    const mockAssignmentsValidator = {
      validateCreateAssignment: jest.fn(),
      validateQueryAssignments: jest.fn(),
    };

    const mockAuditLogService = {
      logEvent: jest.fn().mockResolvedValue(undefined),
      getAuditLogs: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignmentsService,
        { provide: AssignmentRepository, useValue: mockAssignmentRepository },
        { provide: AssignmentsValidator, useValue: mockAssignmentsValidator },
        { provide: DriverRepository, useValue: {} },
        { provide: VehicleRepository, useValue: {} },
        { provide: AuditLogService, useValue: mockAuditLogService },
      ],
    }).compile();

    service = module.get<AssignmentsService>(AssignmentsService);
    assignmentRepository = module.get(AssignmentRepository);
    assignmentsValidator = module.get(AssignmentsValidator);
  });

  describe('create', () => {
    it('should assign a driver to a vehicle', async () => {
      assignmentsValidator.validateCreateAssignment.mockResolvedValue(
        undefined,
      );
      assignmentRepository.create.mockResolvedValue(mockAssignment as any);

      const result = await service.create(
        {
          driverId: 'driver-1',
          vehicleId: 'vehicle-1',
        },
        'test-user-id',
        '127.0.0.1',
      );

      expect(result.status).toBe(HttpStatus.CREATED);
      expect(result.message).toBe('Driver assigned to vehicle successfully');
      expect(result.data).toEqual(mockAssignment);
    });

    it('should reject duplicate assignment', async () => {
      const error = new Error(
        'Driver already has an active vehicle assignment',
      ) as Error & { code?: number };
      error.code = HttpStatus.CONFLICT;
      assignmentsValidator.validateCreateAssignment.mockRejectedValue(error);

      const result = await service.create(
        {
          driverId: 'driver-1',
          vehicleId: 'vehicle-2',
        },
        'test-user-id',
        '127.0.0.1',
      );

      expect(result.status).toBe(HttpStatus.CONFLICT);
    });
  });

  describe('findAll', () => {
    it('should return paginated assignments', async () => {
      assignmentRepository.findMany.mockResolvedValue([mockAssignment] as any);
      assignmentRepository.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.status).toBe(HttpStatus.OK);
      expect(result.data.assignments).toHaveLength(1);
      expect(result.data.pagination.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return assignment by ID', async () => {
      assignmentRepository.findById.mockResolvedValue(mockAssignment as any);

      const result = await service.findOne('assignment-1');

      expect(result.status).toBe(HttpStatus.OK);
      expect(result.data).toEqual(mockAssignment);
    });

    it('should return 404 for non-existent assignment', async () => {
      assignmentRepository.findById.mockResolvedValue(null);

      const result = await service.findOne('non-existent');

      expect(result.status).toBe(HttpStatus.NOT_FOUND);
    });
  });

  describe('remove (unassign)', () => {
    it('should unassign a driver from vehicle', async () => {
      assignmentRepository.findById.mockResolvedValue(mockAssignment as any);
      assignmentRepository.unassign.mockResolvedValue({
        ...mockAssignment,
        unassignedAt: new Date(),
      } as any);

      const result = await service.remove(
        'assignment-1',
        'test-user-id',
        '127.0.0.1',
      );

      expect(result.status).toBe(HttpStatus.OK);
      expect(result.message).toBe(
        'Driver unassigned from vehicle successfully',
      );
    });

    it('should reject unassigning already unassigned', async () => {
      assignmentRepository.findById.mockResolvedValue({
        ...mockAssignment,
        unassignedAt: new Date(),
      } as any);

      const result = await service.remove(
        'assignment-1',
        'test-user-id',
        '127.0.0.1',
      );

      expect(result.status).toBe(HttpStatus.BAD_REQUEST);
    });
  });
});
