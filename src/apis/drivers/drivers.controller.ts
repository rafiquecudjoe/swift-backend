import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
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
import { DriversService } from './drivers.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { QueryDriversDto } from './dto/query-drivers.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import type { AuthenticatedRequest } from '../../common/types';

@Controller('api/v1/drivers')
@ApiTags('Drivers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create new driver (Admin only)' })
  @ApiCreatedResponse({ description: 'Driver created successfully' })
  async create(
    @Body() dto: CreateDriverDto,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    const { status, ...responseData } = await this.driversService.create(
      dto,
      req.user.id,
      req.ip,
    );
    return res.status(status).json(responseData);
  }

  @Get()
  @Roles('ADMIN', 'OPERATIONS')
  @ApiOperation({ summary: 'Get all drivers' })
  @ApiOkResponse({ description: 'Drivers retrieved successfully' })
  async findAll(@Query() query: QueryDriversDto, @Res() res: Response) {
    const { status, ...responseData } =
      await this.driversService.findAll(query);
    return res.status(status).json(responseData);
  }

  @Get(':id')
  @Roles('ADMIN', 'OPERATIONS')
  @ApiOperation({ summary: 'Get driver by ID' })
  @ApiParam({ name: 'id', description: 'Driver ID' })
  @ApiOkResponse({ description: 'Driver retrieved successfully' })
  async findOne(@Param('id') id: string, @Res() res: Response) {
    const { status, ...responseData } = await this.driversService.findOne(id);
    return res.status(status).json(responseData);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update driver (Admin only)' })
  @ApiParam({ name: 'id', description: 'Driver ID' })
  @ApiOkResponse({ description: 'Driver updated successfully' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateDriverDto,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    const { status, ...responseData } = await this.driversService.update(
      id,
      dto,
      req.user.id,
      req.ip,
    );
    return res.status(status).json(responseData);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Deactivate driver (Admin only)' })
  @ApiParam({ name: 'id', description: 'Driver ID' })
  @ApiOkResponse({ description: 'Driver deactivated successfully' })
  async remove(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    const { status, ...responseData } = await this.driversService.remove(
      id,
      req.user.id,
      req.ip,
    );
    return res.status(status).json(responseData);
  }
}
