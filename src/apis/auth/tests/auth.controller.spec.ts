/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { AuthModule } from '../auth.module';
import { JwtAuthGuard } from '../guards/jwt.guard';
import prisma from '../../../common/prisma';
import { Request, Response, NextFunction } from 'express';
import { RepositoriesModule } from '../../../repositories/repositories.module';

jest.setTimeout(30000);

const mockJwtAuthGuard = { canActivate: jest.fn(() => true) };

describe('AuthController E2E Tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    // Clean up test data
    try {
      await prisma.user.deleteMany({
        where: { email: { contains: 'test-auth-e2e' } },
      });
    } catch (error) {
      console.warn('Initial cleanup failed:', error);
    }

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AuthModule, RepositoriesModule],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    app = moduleRef.createNestApplication();

    // Mock req.user for protected endpoints
    app.use((req: Request, _res: Response, next: NextFunction) => {
      if (req.url.includes('/api/v1/auth/profile')) {
        (req as any).user = {
          id: 'test-user-id',
          email: 'test-auth-e2e-profile@example.com',
          role: 'OPERATIONS',
        };
      }
      next();
    });

    await app.init();
  });

  afterAll(async () => {
    try {
      await prisma.user.deleteMany({
        where: { email: { contains: 'test-auth-e2e' } },
      });
      await prisma.$disconnect();
    } catch (error) {
      console.error('Final cleanup failed:', error);
    } finally {
      await app.close();
    }
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register successfully', async () => {
      const dto = {
        email: 'test-auth-e2e-register@example.com',
        password: 'Password@123',
        fullName: 'E2E User',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(dto);

      expect(response.status).toBe(HttpStatus.CREATED);
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.data.user.email).toBe(dto.email);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    it('should register with phone number', async () => {
      const dto = {
        email: 'test-auth-e2e-phone@example.com',
        password: 'Password@123',
        fullName: 'Phone User',
        phoneNumber: '+1234567890',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(dto);

      expect(response.status).toBe(HttpStatus.CREATED);
      expect(response.body.data.user.email).toBe(dto.email);
    });

    it('should return 400 for validation errors (invalid email)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ email: 'invalid-email', password: 'Password@123' });

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 for weak password', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'test-weak@example.com',
          password: 'weak',
          fullName: 'Weak User',
        });

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should return 409 for duplicate email', async () => {
      const dto = {
        email: 'test-auth-e2e-duplicate@example.com',
        password: 'Password@123',
        fullName: 'Duplicate User',
      };

      // Register first time
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(dto);

      // Try again
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(dto);

      expect(response.status).toBe(HttpStatus.CONFLICT);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    const loginEmail = 'test-auth-e2e-login@example.com';
    const password = 'Password@123';

    beforeAll(async () => {
      await request(app.getHttpServer()).post('/api/v1/auth/register').send({
        email: loginEmail,
        password,
        fullName: 'Login User',
      });
    });

    it('should login successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: loginEmail, password });

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    it('should return 401 for wrong password', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: loginEmail, password: 'WrongPassword@123' });

      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
      expect(response.body.message).toBe('Invalid email or password');
    });

    it('should return 401 for non-existent user', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password@123',
        });

      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('should refresh with token rotation (new access + refresh tokens)', async () => {
      const registerResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'test-auth-e2e-refresh@example.com',
          password: 'Password@123',
          fullName: 'Refresh User',
        });

      const refreshToken = registerResponse.body.data.refreshToken;

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken });

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.message).toBe('Token refreshed successfully');
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined(); // New refresh token
    });

    it('should return 401 for invalid refresh token', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'invalid-token' });

      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /api/v1/auth/profile', () => {
    it('should return profile for authenticated user', async () => {
      const email = 'test-auth-e2e-profile@example.com';
      await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
          id: 'test-user-id',
          email,
          password: 'hashedpassword',
          fullName: 'E2E Profile User',
        },
      });

      const response = await request(app.getHttpServer()).get(
        '/api/v1/auth/profile',
      );

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.message).toBe('Profile retrieved');
      expect(response.body.data.email).toBe(email);
      expect(response.body.data.password).toBeUndefined();
    });
  });
});
