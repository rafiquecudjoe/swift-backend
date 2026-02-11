import { Module } from '@nestjs/common';
import { VehiclesController } from './vehicles.controller';
import { VehiclesService } from './vehicles.service';
import { VehiclesValidator } from './vehicles.validator';
import { RepositoriesModule } from '../../repositories/repositories.module';

@Module({
  imports: [RepositoriesModule],
  controllers: [VehiclesController],
  providers: [VehiclesService, VehiclesValidator],
  exports: [VehiclesService],
})
export class VehiclesModule {}
