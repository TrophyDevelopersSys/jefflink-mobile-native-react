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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PropertiesService, PropertyFilterDto } from './properties.service';
import { CreatePropertyDto, UpdatePropertyDto } from './dto/property.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuthUser } from '../../common/types/auth-user.type';

@ApiTags('properties')
@Controller({ path: 'properties', version: '1' })
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List property listings' })
  findAll(@Query() query: PropertyFilterDto) {
    return this.propertiesService.findAll(query);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get property by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.propertiesService.findById(id);
  }

  @Post()
  @ApiBearerAuth('access-token')
  @Roles('VENDOR', 'AGENT', 'ADMIN', 'MANAGER', 'SYSTEM_ADMIN')
  @ApiOperation({ summary: 'Create a property listing' })
  create(@Body() dto: CreatePropertyDto, @CurrentUser() user: AuthUser) {
    return this.propertiesService.create(user.sub, dto);
  }

  @Patch(':id')
  @ApiBearerAuth('access-token')
  @Roles('VENDOR', 'AGENT', 'ADMIN', 'MANAGER', 'SYSTEM_ADMIN')
  @ApiOperation({ summary: 'Update a property listing' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePropertyDto,
  ) {
    return this.propertiesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('access-token')
  @Roles('VENDOR', 'AGENT', 'ADMIN', 'MANAGER', 'SYSTEM_ADMIN')
  @ApiOperation({ summary: 'Remove a property listing' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.propertiesService.remove(id);
  }
}
