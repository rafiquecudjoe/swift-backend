/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from '../auth.service';
import { AuthValidator } from '../auth.validator';
import { UserRepository } from '../../../repositories/user.repository';
import { config } from '../../../config/config';
import prisma from '../../../common/prisma';

jest.setTimeout(30000);

describe('AuthService Integration Tests', () => {
  let service: AuthService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: config.jwtSecret,
          signOptions: { expiresIn: config.jwtExpiresIn },
        }),
      ],
      providers: [AuthService, AuthValidator, UserRepository],
    }).compile();

    service = module.get<AuthService>(AuthService);

    // Clean up test data
    try {
      await prisma.user.deleteMany({
        where: { email: { contains: 'test-auth-' } },
      });
    } catch (error) {
      console.warn('Initial cleanup failed, may be first run:', error);
    }
  });

  afterAll(async () => {
    try {
      await prisma.user.deleteMany({
        where: { email: { contains: 'test-auth-' } },
      });
      await prisma.$disconnect();
    } catch (error) {
      console.error('Final cleanup failed:', error);
    } finally {
      await module.close();
    }
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const dto = {
        email: 'test-auth-register@example.com',
        password: 'Password@123',
        fullName: 'Test Auth User',
        role: 'OPERATIONS' as const,
      };

      const result = await service.register(dto);

      expect(result.status).toBe(201);
      expect(result.message).toBe('User registered successfully');
      expect(result.data).toBeDefined();
      expect((result.data as any).user.email).toBe(dto.email);
      expect((result.data as any).accessToken).toBeDefined();
      expect((result.data as any).refreshToken).toBeDefined();
    });

    it('should register user with phone number', async () => {
      const dto = {
        email: 'test-auth-phone@example.com',
        password: 'Password@123',
        fullName: 'Phone User',
        phoneNumber: '+1234567890',
      };

      const result = await service.register(dto);

      expect(result.status).toBe(201);
      expect((result.data as any).user.email).toBe(dto.email);
    });

    it('should fail if email already exists', async () => {
      const dto = {
        email: 'test-auth-duplicate@example.com',
        password: 'Password@123',
        fullName: 'Duplicate User',
      };

      // Register first time
      await service.register(dto);

      // Try registering again
      await expect(service.register(dto)).rejects.toThrow();
    });

    it('should fail if validation fails (short password)', async () => {
      const dto = {
        email: 'test-auth-invalid@example.com',
        password: '123', // Too short
        fullName: 'Invalid User',
      };

      await expect(service.register(dto)).rejects.toThrow();
    });

    it('should fail if validation fails (weak password)', async () => {
      const dto = {
        email: 'test-auth-weak@example.com',
        password: 'password', // No uppercase, digit, or special char
        fullName: 'Weak Password User',
      };

      await expect(service.register(dto)).rejects.toThrow();
    });
  });

  describe('login', () => {
    const loginEmail = 'test-auth-login@example.com';
    const password = 'Password@123';

    beforeAll(async () => {
      await service.register({
        email: loginEmail,
        password,
        fullName: 'Login User',
      });
    });

    it('should login successfully with correct credentials', async () => {
      const result = await service.login({
        email: loginEmail,
        password,
      });

      expect(result.status).toBe(200);
      expect(result.message).toBe('Login successful');
      expect((result.data as any).user.email).toBe(loginEmail);
      expect((result.data as any).accessToken).toBeDefined();
      expect((result.data as any).refreshToken).toBeDefined();
    });

    it('should fail with incorrect password', async () => {
      await expect(
        service.login({
          email: loginEmail,
          password: 'WrongPassword@123',
        }),
      ).rejects.toThrow('Invalid email or password');
    });

    it('should fail with non-existent email', async () => {
      await expect(
        service.login({
          email: 'nonexistent@example.com',
          password,
        }),
      ).rejects.toThrow('Invalid email or password');
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh with token rotation (new access + refresh tokens)', async () => {
      const registerResult = await service.register({
        email: 'test-auth-refresh@example.com',
        password: 'Password@123',
        fullName: 'Refresh User',
      });

      const refreshToken = (registerResult.data as any).refreshToken;
      const result = await service.refreshAccessToken({ refreshToken });

      expect(result.status).toBe(200);
      expect(result.message).toBe('Token refreshed successfully');
      expect((result.data as any).accessToken).toBeDefined();
      expect((result.data as any).refreshToken).toBeDefined(); // New refresh token
    });

    it('should fail with invalid refresh token', async () => {
      await expect(
        service.refreshAccessToken({
          refreshToken: 'invalid-token',
        }),
      ).rejects.toThrow('Invalid or expired refresh token');
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const email = 'test-auth-profile@example.com';
      const registerResult = await service.register({
        email,
        password: 'Password@123',
        fullName: 'Profile User',
      });

      const userId = (registerResult.data as any).user.id;
      const result = await service.getProfile(userId);

      expect(result.status).toBe(200);
      expect(result.message).toBe('Profile retrieved');
      expect((result.data as any).email).toBe(email);
      expect((result.data as any).fullName).toBe('Profile User');
      expect((result.data as any).password).toBeUndefined(); // Password should not be returned
    });

    it('should return 404 for non-existent user', async () => {
      await expect(service.getProfile('non-existent-id')).rejects.toThrow(
        'User not found',
      );
    });
  });
});
