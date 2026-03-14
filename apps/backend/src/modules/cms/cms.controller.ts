import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CmsService } from './cms.service';
import { CreateSliderDto } from './dto/create-slider.dto';
import { UpsertContentDto } from './dto/upsert-content.dto';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('cms')
@Controller({ path: 'cms', version: '1' })
export class CmsController {
  constructor(private readonly svc: CmsService) {}

  // ── Public endpoints ───────────────────────────────────────────────────────

  /**
   * GET /api/v1/cms/homepage
   *
   * Single endpoint the frontend uses to hydrate the homepage.
   * Returns heroSliders (R2 CDN URLs), heroBanners, and content key→value map.
   */
  @Get('homepage')
  @ApiOperation({ summary: 'Get homepage CMS content (sliders, banners, text)' })
  getHomepage() {
    return this.svc.getHomepage();
  }

  // ── Admin endpoints (ADMIN / SYSTEM_ADMIN only) ───────────────────────────

  @Get('sliders')
  @ApiBearerAuth()
  @Roles('ADMIN', 'SYSTEM_ADMIN')
  @ApiOperation({ summary: '[Admin] List all sliders' })
  listSliders() {
    return this.svc.listSliders();
  }

  @Post('sliders')
  @ApiBearerAuth()
  @Roles('ADMIN', 'SYSTEM_ADMIN')
  @ApiOperation({ summary: '[Admin] Create slider' })
  createSlider(@Body() dto: CreateSliderDto) {
    return this.svc.createSlider(dto);
  }

  @Put('sliders/:id')
  @ApiBearerAuth()
  @Roles('ADMIN', 'SYSTEM_ADMIN')
  @ApiOperation({ summary: '[Admin] Update slider' })
  updateSlider(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateSliderDto,
  ) {
    return this.svc.updateSlider(id, dto);
  }

  @Delete('sliders/:id')
  @ApiBearerAuth()
  @Roles('ADMIN', 'SYSTEM_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '[Admin] Delete slider' })
  deleteSlider(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.deleteSlider(id);
  }

  @Get('content')
  @ApiBearerAuth()
  @Roles('ADMIN', 'SYSTEM_ADMIN')
  @ApiOperation({ summary: '[Admin] List all content blocks' })
  listContent() {
    return this.svc.listContent();
  }

  @Post('content')
  @ApiBearerAuth()
  @Roles('ADMIN', 'SYSTEM_ADMIN')
  @ApiOperation({ summary: '[Admin] Create or update a content block (upsert by key)' })
  upsertContent(@Body() dto: UpsertContentDto) {
    return this.svc.upsertContent(dto);
  }

  @Delete('content/:key')
  @ApiBearerAuth()
  @Roles('ADMIN', 'SYSTEM_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '[Admin] Delete a content block by key' })
  deleteContent(@Param('key') key: string) {
    return this.svc.deleteContent(key);
  }
}
