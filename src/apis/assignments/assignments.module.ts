import { Module } from '@nestjs/common';
import { AssignmentsController } from './assignments.controller';
import { AssignmentsService } from './assignments.service';
import { AssignmentsValidator } from './assignments.validator';
import { RepositoriesModule } from '../../repositories/repositories.module';

@Module({
  imports: [RepositoriesModule],
  controllers: [AssignmentsController],
  providers: [AssignmentsService, AssignmentsValidator],
  exports: [AssignmentsService],
})
export class AssignmentsModule {}
