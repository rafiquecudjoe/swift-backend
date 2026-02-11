import { ApiProperty } from '@nestjs/swagger';

export class CreateVehicleDto {
  @ApiProperty({
    example: 'KAA123X',
    description: 'Vehicle registration number',
  })
  registrationNumber: string;
}
