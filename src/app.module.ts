import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './apis/auth/auth.module';
import { DriversModule } from './apis/drivers/drivers.module';
import { VehiclesModule } from './apis/vehicles/vehicles.module';
import { AssignmentsModule } from './apis/assignments/assignments.module';
import { RepositoriesModule } from './repositories/repositories.module';

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({ isGlobal: true }),
    // Rate limiting
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    // Feature modules
    AuthModule,
    DriversModule,
    VehiclesModule,
    AssignmentsModule,
    // Shared modules
    RepositoriesModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
