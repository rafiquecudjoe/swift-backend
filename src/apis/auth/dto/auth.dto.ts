import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'admin@swift.com',
    description: 'User email address',
  })
  email: string;

  @ApiProperty({
    example: 'Admin@123',
    description: 'User password (min 8 characters)',
  })
  password: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'User full name',
  })
  fullName: string;

  @ApiPropertyOptional({
    example: '+1234567890',
    description: 'Phone number',
  })
  phoneNumber?: string;

  @ApiPropertyOptional({
    example: 'ADMIN',
    description: 'User role: ADMIN or OPERATIONS',
    enum: ['ADMIN', 'OPERATIONS'],
  })
  role?: 'ADMIN' | 'OPERATIONS';
}

export class LoginDto {
  @ApiProperty({
    example: 'admin@swift.com',
    description: 'User email address',
  })
  email: string;

  @ApiProperty({
    example: 'Admin@123',
    description: 'User password',
  })
  password: string;
}
