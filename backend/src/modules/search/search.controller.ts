import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn } from 'class-validator';
import { SearchService } from './search.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('search')
@Controller({ path: 'search', version: '1' })
export class SearchController {
  constructor(private readonly svc: SearchService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Full-text search across vehicles and properties' })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'type', required: false, enum: ['vehicles', 'properties'] })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  search(
    @Query('q') q = '',
    @Query('type') type: 'vehicles' | 'properties' = 'vehicles',
    @Query('filter') filter?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    const index = type === 'properties' ? 'properties' : 'vehicles';
    return this.svc.search(index, q, {
      filter,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });
  }
}
