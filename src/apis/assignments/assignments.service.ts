import { HttpStatus, Injectable } from '@nestjs/common';
import { AssignmentRepository } from '../../repositories/assignment.repository';
import { AssignmentsValidator } from './assignments.validator';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { QueryAssignmentsDto } from './dto/query-assignments.dto';
import {
  generateErrorResponse,
  generateSuccessResponse,
  throwError,
} from '../../utils/utils';
import { CaughtError } from '../../utils/entities/utils.entity';
import { logError } from '../../utils/logger';
import { AuditLogService } from '../../common/audit-log/audit-log.service';
import {
  AuditAction,
  AuditEntity,
} from '../../common/entities/audit-log.entity';

@Injectable()
export class AssignmentsService {
  constructor(
    private readonly assignmentRepository: AssignmentRepository,
    private readonly assignmentsValidator: AssignmentsValidator,
    private readonly auditLogService: AuditLogService,
  ) {}

  async create(
    dto: CreateAssignmentDto,
    userId: string,
    ipAddress: string,
  ): Promise<any> {
    try {
      await this.assignmentsValidator.validateCreateAssignment(dto);

      const assignment = await this.assignmentRepository.create({
        driver: { connect: { id: dto.driverId } },
        vehicle: { connect: { id: dto.vehicleId } },
      });

      // Audit logging
      await this.auditLogService.logEvent(
        AuditAction.ASSIGN,
        AuditEntity.ASSIGNMENT,
        {
          userId,
          entityId: assignment.id,
          details: { driverId: dto.driverId, vehicleId: dto.vehicleId },
          ipAddress,
        },
      );

      return generateSuccessResponse({
        statusCode: HttpStatus.CREATED,
        message: 'Driver assigned to vehicle successfully',
        data: assignment,
      });
    } catch (error) {
      logError(`create assignment: ${error} `);
      return generateErrorResponse(error as CaughtError);
    }
  }

  async findAll(query: QueryAssignmentsDto): Promise<any> {
    try {
      this.assignmentsValidator.validateQueryAssignments(query);

      const { page = 1, limit = 10, driverId, vehicleId, activeOnly } = query;
      const skip = (page - 1) * limit;

      const where: any = {};
      if (driverId) where.driverId = driverId;
      if (vehicleId) where.vehicleId = vehicleId;
      if (activeOnly) where.unassignedAt = null;

      const [assignments, total] = await Promise.all([
        this.assignmentRepository.findMany({ skip, take: limit, where }),
        this.assignmentRepository.count(where),
      ]);

      return generateSuccessResponse({
        statusCode: HttpStatus.OK,
        message: 'Assignments retrieved successfully',
        data: {
          assignments,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      logError(`find all assignments: ${error} `);
      return generateErrorResponse(error as CaughtError);
    }
  }

  async findOne(id: string): Promise<any> {
    try {
      const assignment = await this.assignmentRepository.findById(id);
      if (!assignment) {
        throwError('Assignment not found', HttpStatus.NOT_FOUND);
      }

      return generateSuccessResponse({
        statusCode: HttpStatus.OK,
        message: 'Assignment retrieved successfully',
        data: assignment,
      });
    } catch (error) {
      logError(`find assignment ${id}: ${error} `);
      return generateErrorResponse(error as CaughtError);
    }
  }

  async remove(id: string, userId: string, ipAddress: string): Promise<any> {
    try {
      const assignment = await this.assignmentRepository.findById(id);
      if (!assignment) {
        throwError('Assignment not found', HttpStatus.NOT_FOUND);
      }

      if (assignment.unassignedAt) {
        throwError('Assignment already unassigned', HttpStatus.BAD_REQUEST);
      }

      await this.assignmentRepository.unassign(id);

      // Audit logging
      await this.auditLogService.logEvent(
        AuditAction.UNASSIGN,
        AuditEntity.ASSIGNMENT,
        {
          userId,
          entityId: id,
          ipAddress,
        },
      );

      return generateSuccessResponse({
        statusCode: HttpStatus.OK,
        message: 'Driver unassigned from vehicle successfully',
        data: null,
      });
    } catch (error) {
      logError(`unassign ${id}: ${error} `);
      return generateErrorResponse(error as CaughtError);
    }
  }
}
