import { Module } from '@nestjs/common';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthValidator } from './auth.validator';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RepositoriesModule } from '../../repositories/repositories.module';
import { config } from '../../config/config';

@Module({
  imports: [
    RepositoriesModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: config.jwtSecret,
      signOptions: { expiresIn: config.jwtExpiresIn } as JwtSignOptions,
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthValidator, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
