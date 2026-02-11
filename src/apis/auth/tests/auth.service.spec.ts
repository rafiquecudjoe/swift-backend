import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { HttpStatus } from '@nestjs/common';
import * as argon2 from 'argon2';
import { AuthService } from '../auth.service';
import { AuthValidator } from '../auth.validator';
import { UserRepository } from '../../../repositories/user.repository';

jest.mock('argon2');

describe('AuthService Unit Tests', () => {
  let service: AuthService;
  let userRepository: jest.Mocked<UserRepository>;
  let jwtService: jest.Mocked<JwtService>;
  let authValidator: jest.Mocked<AuthValidator>;

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    password: 'hashed-password',
    fullName: 'Test User',
    role: 'OPERATIONS',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    const mockUserRepository = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    const mockAuthValidator = {
      validateRegisterDto: jest.fn(),
      validateLoginDto: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: JwtService, useValue: mockJwtService },
        { provide: AuthValidator, useValue: mockAuthValidator },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get(UserRepository);
    jwtService = module.get(JwtService);
    authValidator = module.get(AuthValidator);

    jest.spyOn(argon2, 'hash').mockResolvedValue('hashed-password');
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      authValidator.validateRegisterDto.mockResolvedValue(undefined);
      userRepository.create.mockResolvedValue(mockUser as any);
      jwtService.sign.mockReturnValue('mock-token');

      const result: any = await service.register({
        email: 'test@example.com',
        password: 'Password@123',
        fullName: 'Test User',
      });

      expect(result.status).toBe(HttpStatus.CREATED);
      expect(result.data.user.email).toBe(mockUser.email);
      expect(result.data.accessToken).toBeDefined();
    });

    it('should handle registration validation failure', async () => {
      const error = new Error('Email already exists') as any;
      error.code = HttpStatus.CONFLICT;
      authValidator.validateRegisterDto.mockRejectedValue(error);

      const result: any = await service.register({
        email: 'test@example.com',
        password: 'Password@123',
        fullName: 'Test User',
      });

      expect(result.status).toBe(HttpStatus.CONFLICT);
      expect(result.message).toBe('Email already exists');
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      authValidator.validateLoginDto.mockResolvedValue(mockUser as any);
      jwtService.sign.mockReturnValue('mock-token');

      const result: any = await service.login({
        email: 'test@example.com',
        password: 'Password@123',
      });

      expect(result.status).toBe(HttpStatus.OK);
      expect(result.data.user.email).toBe(mockUser.email);
      expect(result.data.accessToken).toBeDefined();
    });

    it('should handle login failure', async () => {
      const error = new Error('Invalid credentials') as any;
      error.code = HttpStatus.UNAUTHORIZED;
      authValidator.validateLoginDto.mockRejectedValue(error);

      const result: any = await service.login({
        email: 'test@example.com',
        password: 'WrongPassword',
      });

      expect(result.status).toBe(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      userRepository.findById.mockResolvedValue(mockUser as any);

      const result: any = await service.getProfile('user-1');

      expect(result.status).toBe(HttpStatus.OK);
      expect(result.data.email).toBe(mockUser.email);
    });

    it('should return 404 for non-existent user', async () => {
      userRepository.findById.mockResolvedValue(null);

      const result: any = await service.getProfile('non-existent');

      expect(result.status).toBe(HttpStatus.NOT_FOUND);
    });
  });
});
