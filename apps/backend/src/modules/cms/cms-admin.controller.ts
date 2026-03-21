import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/types/auth-user.type';
import type { AuditActor } from '../admin/services/audit-log.service';
import { CmsFacade } from './cms.facade';
import { CreateCmsPageDto } from './dto/create-cms-page.dto';
import { UpdateCmsPageDto } from './dto/update-cms-page.dto';
import { PublishCmsPageDto } from './dto/publish-cms-page.dto';
import { UpsertCmsNavigationDto } from './dto/upsert-cms-navigation.dto';
import { UpdateCmsSettingsDto } from './dto/update-cms-settings.dto';
import { QueryCmsPageDto } from './dto/query-cms-page.dto';

@ApiTags('admin / cms')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SYSTEM_ADMIN')
@Controller({ path: 'admin/cms', version: '1' })
export class CmsAdminController {
  constructor(private readonly facade: CmsFacade) {}

  private toActor(user: AuthUser, req: Request): AuditActor {
    return { sub: user.sub, role: user.role, ipAddress: req.ip };
  }

  // ── Pages ─────────────────────────────────────────────────────────────────

  @Get('pages')
  @ApiOperation({ summary: '[Admin] List CMS pages' })
  listPages(@Query() query: QueryCmsPageDto) {
    return this.facade.listPages({
      slug: undefined as any,
      platform: query.platform,
      locale: query.locale,
    });
  }

  @Post('pages')
  @ApiOperation({ summary: '[Admin] Create a CMS page' })
  createPage(
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
    @Body() dto: CreateCmsPageDto,
  ) {
    return this.facade.createPage(
      this.toActor(user, req),
      {
        slug: dto.slug,
        platform: dto.platform,
        locale: dto.locale ?? 'en',
        title: dto.title,
        layout: dto.layout as any,
        seo: dto.seo,
        status: (dto.status as any) ?? 'DRAFT',
      },
    );
  }

  @Patch('pages/:id')
  @ApiOperation({ summary: '[Admin] Update a CMS page' })
  @ApiParam({ name: 'id', description: 'Page ID' })
  updatePage(
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateCmsPageDto,
  ) {
    const { expectedVersion, ...patch } = dto;
    return this.facade.updatePage(this.toActor(user, req), id, patch as any, expectedVersion);
  }

  @Post('pages/:id/publish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Publish or archive a CMS page' })
  publishPage(
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: PublishCmsPageDto,
  ) {
    return this.facade.publishPage(this.toActor(user, req), id, dto.status);
  }

  @Delete('pages/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '[Admin] Delete a CMS page' })
  deletePage(
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
    @Param('id') id: string,
  ) {
    return this.facade.deletePage(this.toActor(user, req), id);
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  @Put('navigation/:key')
  @ApiOperation({ summary: '[Admin] Upsert a navigation menu' })
  upsertNavigation(
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
    @Param('key') key: string,
    @Body() dto: UpsertCmsNavigationDto,
  ) {
    return this.facade.upsertNavigation(this.toActor(user, req), {
      key,
      platform: dto.platform,
      items: dto.items,
      status: 'PUBLISHED',
    });
  }

  // ── Settings ──────────────────────────────────────────────────────────────

  @Put('settings')
  @ApiOperation({ summary: '[Admin] Update global CMS settings' })
  updateSettings(
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
    @Body() dto: UpdateCmsSettingsDto,
  ) {
    return this.facade.updateSettings(this.toActor(user, req), dto);
  }
}
