import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { UserRepository } from '../../repositories/user.repository';
import {
  throwError,
  generateErrorResponse,
  generateSuccessResponse,
} from '../../utils/utils';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthValidator } from './auth.validator';
import { config } from '../../config/config';
import { logError, logDebugMessage } from '../../utils/logger';
import { CaughtError } from '../../utils/entities/utils.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly authValidator: AuthValidator,
  ) {}

  private generateTokens(userId: string, email: string, role: string) {
    const accessToken = this.jwtService.sign(
      { sub: userId, email, role },
      { expiresIn: config.jwtExpiresIn },
    );

    const refreshToken = this.jwtService.sign(
      { sub: userId, email, role },
      { expiresIn: config.jwtRefreshExpiresIn },
    );

    return { accessToken, refreshToken };
  }

  async register(dto: RegisterDto) {
    try {
      await this.authValidator.validateRegisterDto(dto);

      // Hash password with argon2
      const hashedPassword = await argon2.hash(dto.password);

      // Create user
      const user = await this.userRepository.create({
        email: dto.email,
        password: hashedPassword,
        fullName: dto.fullName,
        phoneNumber: dto.phoneNumber,
        role: dto.role || 'OPERATIONS',
      });

      // Generate access and refresh tokens
      const { accessToken, refreshToken } = this.generateTokens(
        user.id,
        user.email,
        user.role,
      );

      return generateSuccessResponse({
        statusCode: HttpStatus.CREATED,
        message: 'User registered successfully',
        data: {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
          },
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      logError(`register: email=${dto.email} => ${error}`);
      return generateErrorResponse(error as CaughtError);
    }
  }

  async login(dto: LoginDto) {
    try {
      const user = await this.authValidator.validateLoginDto(dto);

      // Generate access and refresh tokens
      const { accessToken, refreshToken } = this.generateTokens(
        user.id,
        user.email,
        user.role,
      );

      return generateSuccessResponse({
        statusCode: HttpStatus.OK,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
          },
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      logError(`login: email=${dto.email} => ${error}`);
      return generateErrorResponse(error as CaughtError);
    }
  }

  async refreshAccessToken(dto: RefreshTokenDto) {
    try {
      // Verify refresh token
      const payload = this.jwtService.verify(dto.refreshToken);

      // Generate tokens
      const { accessToken, refreshToken } = this.generateTokens(
        payload.sub,
        payload.email,
        payload.role,
      );

      return generateSuccessResponse({
        statusCode: HttpStatus.OK,
        message: 'Token refreshed successfully',
        data: {
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      logDebugMessage(`Failed token refresh attempt: ${error}`);
      return generateErrorResponse(error as CaughtError);
    }
  }

  async getProfile(userId: string) {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throwError('User not found', HttpStatus.NOT_FOUND);
      }

      return generateSuccessResponse({
        statusCode: HttpStatus.OK,
        message: 'Profile retrieved',
        data: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    } catch (error) {
      logError(`getProfile: userId=${userId} => ${error}`);
      return generateErrorResponse(error as CaughtError);
    }
  }
}
