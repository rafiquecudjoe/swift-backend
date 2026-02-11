import { Module, Global } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { DriverRepository } from './driver.repository';
import { VehicleRepository } from './vehicle.repository';
import { AssignmentRepository } from './assignment.repository';

@Global()
@Module({
  providers: [
    UserRepository,
    DriverRepository,
    VehicleRepository,
    AssignmentRepository,
  ],
  exports: [
    UserRepository,
    DriverRepository,
    VehicleRepository,
    AssignmentRepository,
  ],
})
export class RepositoriesModule {}
