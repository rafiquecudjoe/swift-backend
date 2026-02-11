import { Injectable, Logger } from '@nestjs/common';
import {
  AuditAction,
  AuditEntity,
  AuditLogDto,
} from '../entities/audit-log.entity';
import prisma from '../prisma';

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  /**
   * Log an audit event
   * This is async and non-blocking to avoid impacting performance
   */
  async logEvent(
    action: AuditAction,
    entity: AuditEntity,
    dto: Partial<AuditLogDto>,
  ): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          action,
          entity,
          userId: dto.userId,
          entityId: dto.entityId,
          details: dto.details,
          ipAddress: dto.ipAddress,
        },
      });
    } catch (error) {
      // Don't throw errors from audit logging to prevent app failure
      this.logger.error(
        `Failed to log audit event: ${action} ${entity}`,
        error,
      );
    }
  }

  /**
   * Get audit logs with optional filters
   */
  async getAuditLogs(filters?: {
    userId?: string;
    entity?: AuditEntity;
    action?: AuditAction;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }) {
    return prisma.auditLog.findMany({
      where: {
        userId: filters?.userId,
        entity: filters?.entity,
        action: filters?.action,
        timestamp: {
          gte: filters?.startDate,
          lte: filters?.endDate,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: filters?.limit || 100,
    });
  }
}
