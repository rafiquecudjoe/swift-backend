import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ResponseWithData } from '../../common/entities/response.entity';
import { JwtAuthGuard } from './guards/jwt.guard';
import type { AuthenticatedRequest } from '../../common/types';

@Controller('api/v1/auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Register a new user' })
  @ApiCreatedResponse({
    description: 'User registered successfully',
    type: ResponseWithData,
  })
  @ApiBadRequestResponse({ description: 'Validation error' })
  async register(@Body() requestBody: RegisterDto, @Res() res: Response) {
    const { status, ...responseData } =
      await this.authService.register(requestBody);
    return res.status(status).json(responseData);
  }

  @Post('login')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiOkResponse({ description: 'Login successful', type: ResponseWithData })
  @ApiBadRequestResponse({ description: 'Invalid credentials' })
  @ApiUnauthorizedResponse({ description: 'Invalid email or password' })
  async login(@Body() requestBody: LoginDto, @Res() res: Response) {
    const { status, ...responseData } =
      await this.authService.login(requestBody);
    return res.status(status).json(responseData);
  }

  @Post('refresh')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiOkResponse({ description: 'Token refreshed', type: ResponseWithData })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired refresh token' })
  async refresh(@Body() requestBody: RefreshTokenDto, @Res() res: Response) {
    const { status, ...responseData } =
      await this.authService.refreshAccessToken(requestBody);
    return res.status(status).json(responseData);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiOkResponse({ description: 'Profile retrieved', type: ResponseWithData })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async getProfile(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    const userId = req.user.id;
    const { status, ...responseData } =
      await this.authService.getProfile(userId);
    return res.status(status).json(responseData);
  }
}
