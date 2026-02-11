import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDriverDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Driver full name',
  })
  fullName: string;

  @ApiProperty({
    example: '+254712345678',
    description: 'Driver phone number',
  })
  phoneNumber: string;

  @ApiProperty({
    example: 'DL123456789',
    description: 'Driver license number',
  })
  licenseNumber: string;

  @ApiPropertyOptional({
    enum: ['ACTIVE', 'SUSPENDED', 'INACTIVE'],
    default: 'ACTIVE',
    description: 'Driver status',
  })
  status?: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
}
