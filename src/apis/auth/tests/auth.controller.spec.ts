import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { AuditLogService } from '../../../common/audit-log/audit-log.service';

describe('AuthController Unit Tests', () => {
  let app: INestApplication;
  let authService: jest.Mocked<AuthService>;

  const mockResponse = (status: number, data?: any, message?: string) => ({
    status,
    message: message || (status >= 400 ? 'Error' : 'Success'),
    data,
  });

  beforeAll(async () => {
    const mockAuthService = {
      register: jest.fn(),
      login: jest.fn(),
      refreshAccessToken: jest.fn(),
      getProfile: jest.fn(),
    };

    const mockAuditLogService = {
      logEvent: jest.fn(),
      getAuditLogs: jest.fn(),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: AuditLogService, useValue: mockAuditLogService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleRef.createNestApplication();
    authService = moduleRef.get(AuthService);

    // Mock req.user for protected endpoints
    app.use((req: any, _res: any, next: any) => {
      req.user = { id: 'test-user-id', email: 'test@example.com' };
      next();
    });

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register successfully', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'Password@123',
        fullName: 'User',
      };
      authService.register.mockResolvedValue(
        mockResponse(
          HttpStatus.CREATED,
          { user: { email: dto.email } },
          'User registered successfully',
        ) as any,
      );

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(dto);

      expect(response.status).toBe(HttpStatus.CREATED);
      expect(response.body.message).toBe('User registered successfully');
    });

    it('should return 400 for validation errors', async () => {
      authService.register.mockResolvedValue(
        mockResponse(
          HttpStatus.BAD_REQUEST,
          undefined,
          'Validation failed',
        ) as any,
      );

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ email: 'invalid' });

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login successfully', async () => {
      authService.login.mockResolvedValue(
        mockResponse(
          HttpStatus.OK,
          { accessToken: 'token' },
          'Login successful',
        ) as any,
      );

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'test@example.com', password: 'password' });

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.data.accessToken).toBeDefined();
    });

    it('should return 401 for invalid credentials', async () => {
      authService.login.mockResolvedValue(
        mockResponse(
          HttpStatus.UNAUTHORIZED,
          undefined,
          'Invalid email or password',
        ) as any,
      );

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'test@example.com', password: 'wrong' });

      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /api/v1/auth/profile', () => {
    it('should return profile', async () => {
      authService.getProfile.mockResolvedValue(
        mockResponse(
          HttpStatus.OK,
          { email: 'test@example.com' },
          'Profile retrieved',
        ) as any,
      );

      // Bypass guard by using app.use in init if needed, but here we override guard
      const response = await request(app.getHttpServer()).get(
        '/api/v1/auth/profile',
      );

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.data.email).toBe('test@example.com');
    });
  });
});
