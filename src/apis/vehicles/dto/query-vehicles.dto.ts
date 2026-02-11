import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryVehiclesDto {
  @ApiPropertyOptional({
    minimum: 1,
    default: 1,
    description: 'Page number for pagination',
  })
  page?: number;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: 100,
    default: 10,
    description: 'Number of items per page',
  })
  limit?: number;
}
