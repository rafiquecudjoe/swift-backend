import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateDriverDto {
  @ApiPropertyOptional({
    example: 'John Doe',
    description: 'Driver full name',
  })
  fullName?: string;

  @ApiPropertyOptional({
    example: '+254712345678',
    description: 'Driver phone number',
  })
  phoneNumber?: string;

  @ApiPropertyOptional({
    example: 'DL123456789',
    description: 'Driver license number',
  })
  licenseNumber?: string;

  @ApiPropertyOptional({
    enum: ['ACTIVE', 'SUSPENDED', 'INACTIVE'],
    description: 'Driver status',
  })
  status?: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
}
