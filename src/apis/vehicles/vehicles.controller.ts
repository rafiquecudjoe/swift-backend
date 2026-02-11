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
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { QueryVehiclesDto } from './dto/query-vehicles.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import type { AuthenticatedRequest } from '../../common/types';

@Controller('api/v1/vehicles')
@ApiTags('Vehicles')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create new vehicle (Admin only)' })
  @ApiCreatedResponse({ description: 'Vehicle created successfully' })
  async create(
    @Body() dto: CreateVehicleDto,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    const { status, ...responseData } = await this.vehiclesService.create(
      dto,
      req.user.id,
      req.ip,
    );
    return res.status(status).json(responseData);
  }

  @Get()
  @Roles('ADMIN', 'OPERATIONS')
  @ApiOperation({ summary: 'Get all vehicles' })
  @ApiOkResponse({ description: 'Vehicles retrieved successfully' })
  async findAll(@Query() query: QueryVehiclesDto, @Res() res: Response) {
    const { status, ...responseData } =
      await this.vehiclesService.findAll(query);
    return res.status(status).json(responseData);
  }

  @Get(':id')
  @Roles('ADMIN', 'OPERATIONS')
  @ApiOperation({ summary: 'Get vehicle by ID' })
  @ApiParam({ name: 'id', description: 'Vehicle ID' })
  @ApiOkResponse({ description: 'Vehicle retrieved successfully' })
  async findOne(@Param('id') id: string, @Res() res: Response) {
    const { status, ...responseData } = await this.vehiclesService.findOne(id);
    return res.status(status).json(responseData);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update vehicle (Admin only)' })
  @ApiParam({ name: 'id', description: 'Vehicle ID' })
  @ApiOkResponse({ description: 'Vehicle updated successfully' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateVehicleDto,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    const { status, ...responseData } = await this.vehiclesService.update(
      id,
      dto,
      req.user.id,
      req.ip,
    );
    return res.status(status).json(responseData);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Deactivate vehicle (Admin only)' })
  @ApiParam({ name: 'id', description: 'Vehicle ID' })
  @ApiOkResponse({ description: 'Vehicle deactivated successfully' })
  async remove(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    const { status, ...responseData } = await this.vehiclesService.remove(
      id,
      req.user.id,
      req.ip,
    );
    return res.status(status).json(responseData);
  }
}
