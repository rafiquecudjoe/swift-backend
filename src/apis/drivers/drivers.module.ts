import { Module } from '@nestjs/common';
import { DriversController } from './drivers.controller';
import { DriversService } from './drivers.service';
import { DriversValidator } from './drivers.validator';
import { RepositoriesModule } from '../../repositories/repositories.module';

@Module({
  imports: [RepositoriesModule],
  controllers: [DriversController],
  providers: [DriversService, DriversValidator],
  exports: [DriversService],
})
export class DriversModule {}
