import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { QueryAssignmentsDto } from './dto/query-assignments.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('api/v1/assignments')
@ApiTags('Assignments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) { }

  @Post()
  @Roles('ADMIN', 'OPERATIONS')
  @ApiOperation({ summary: 'Assign driver to vehicle (Admin & Operations)' })
  @ApiCreatedResponse({ description: 'Driver assigned successfully' })
  async create(@Body() dto: CreateAssignmentDto, @Res() res: Response) {
    const { status, ...responseData } =
      await this.assignmentsService.create(dto);
    return res.status(status).json(responseData);
  }

  @Get()
  @Roles('ADMIN', 'OPERATIONS')
  @ApiOperation({ summary: 'Get all assignments' })
  @ApiOkResponse({ description: 'Assignments retrieved successfully' })
  async findAll(@Query() query: QueryAssignmentsDto, @Res() res: Response) {
    const { status, ...responseData } =
      await this.assignmentsService.findAll(query);
    return res.status(status).json(responseData);
  }

  @Get(':id')
  @Roles('ADMIN', 'OPERATIONS')
  @ApiOperation({ summary: 'Get assignment by ID' })
  @ApiParam({ name: 'id', description: 'Assignment ID' })
  @ApiOkResponse({ description: 'Assignment retrieved successfully' })
  async findOne(@Param('id') id: string, @Res() res: Response) {
    const { status, ...responseData } =
      await this.assignmentsService.findOne(id);
    return res.status(status).json(responseData);
  }

  @Delete(':id')
  @Roles('ADMIN', 'OPERATIONS')
  @ApiOperation({
    summary: 'Unassign driver from vehicle (Admin & Operations)',
  })
  @ApiParam({ name: 'id', description: 'Assignment ID' })
  @ApiOkResponse({ description: 'Driver unassigned successfully' })
  async remove(@Param('id') id: string, @Res() res: Response) {
    const { status, ...responseData } =
      await this.assignmentsService.remove(id);
    return res.status(status).json(responseData);
  }
}
