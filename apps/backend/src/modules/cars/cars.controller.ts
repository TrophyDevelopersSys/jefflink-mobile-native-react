import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Version,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { CarsService, CarFilterDto } from './cars.service';
import { CreateCarDto, UpdateCarDto } from './dto/car.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuthUser } from '../../common/types/auth-user.type';

@ApiTags('cars')
@Controller({ path: 'cars', version: '1' })
export class CarsController {
  constructor(private readonly carsService: CarsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List vehicle listings' })
  @ApiQuery({ name: 'location', required: false })
  @ApiQuery({ name: 'minPrice', required: false, type: Number })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'make', required: false })
  findAll(@Query() query: CarFilterDto & PaginationDto) {
    return this.carsService.findAll(query);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get vehicle by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.carsService.findById(id);
  }

  @Post()
  @ApiBearerAuth('access-token')
  @Roles('VENDOR', 'AGENT', 'ADMIN', 'MANAGER', 'SYSTEM_ADMIN')
  @ApiOperation({ summary: 'Create a vehicle listing' })
  create(@Body() dto: CreateCarDto, @CurrentUser() user: AuthUser) {
    return this.carsService.create(user.sub, dto);
  }

  @Patch(':id')
  @ApiBearerAuth('access-token')
  @Roles('VENDOR', 'AGENT', 'ADMIN', 'MANAGER', 'SYSTEM_ADMIN')
  @ApiOperation({ summary: 'Update a vehicle listing' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCarDto,
  ) {
    return this.carsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('access-token')
  @Roles('VENDOR', 'AGENT', 'ADMIN', 'MANAGER', 'SYSTEM_ADMIN')
  @ApiOperation({ summary: 'Remove a vehicle listing' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.carsService.remove(id);
  }
}
