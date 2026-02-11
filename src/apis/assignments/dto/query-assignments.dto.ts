import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryAssignmentsDto {
  @ApiPropertyOptional({
    description: 'Filter by driver ID',
  })
  driverId?: string;

  @ApiPropertyOptional({
    description: 'Filter by vehicle ID',
  })
  vehicleId?: string;

  @ApiPropertyOptional({
    description: 'Filter by active assignments only',
  })
  activeOnly?: boolean;

  @ApiPropertyOptional({
    minimum: 1,
    default: 1,
  })
  page?: number;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  limit?: number;
}
