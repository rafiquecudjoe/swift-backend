import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateVehicleDto {
  @ApiPropertyOptional({
    example: 'KAA123X',
    description: 'Vehicle registration number',
  })
  registrationNumber?: string;
}
