import { HttpStatus, Injectable } from '@nestjs/common';
import * as joi from 'joi';
import * as argon2 from 'argon2';
import { validateJoiSchema } from '../../utils/joi.validator';
import { throwError } from '../../utils/utils';
import { UserRepository } from '../../repositories/user.repository';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthValidator {
  constructor(private readonly userRepository: UserRepository) {}

  async validateRegisterDto(dto: RegisterDto): Promise<void> {
    const joiSchema = joi
      .object({
        email: joi.string().email().required().label('Email'),
        password: joi
          .string()
          .required()
          .min(8)
          .pattern(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
          )
          .message(
            'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character',
          )
          .label('Password'),
        fullName: joi.string().required().label('Full name'),
        phoneNumber: joi
          .string()
          .pattern(/^\+?[0-9]\d{9,14}$/)
          .optional()
          .label('Phone number'),
        role: joi
          .string()
          .valid('ADMIN', 'OPERATIONS')
          .optional()
          .label('Role'),
      })
      .strict();

    const results = validateJoiSchema(joiSchema, dto);
    if (results) throwError(results, HttpStatus.BAD_REQUEST);

    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throwError('User with this email already exists', HttpStatus.CONFLICT);
    }
  }

  async validateLoginDto(dto: LoginDto) {
    const joiSchema = joi
      .object({
        email: joi.string().email().required().label('Email'),
        password: joi.string().required().min(8).label('Password'),
      })
      .strict();

    const results = validateJoiSchema(joiSchema, dto);
    if (results) throwError(results, HttpStatus.BAD_REQUEST);

    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throwError('Invalid email or password', HttpStatus.UNAUTHORIZED);
    }

    const isPasswordValid = await argon2.verify(user.password, dto.password);
    if (!isPasswordValid) {
      throwError('Invalid email or password', HttpStatus.UNAUTHORIZED);
    }

    if (!user.isActive) {
      throwError('Account is inactive', HttpStatus.FORBIDDEN);
    }

    return user;
  }
}
