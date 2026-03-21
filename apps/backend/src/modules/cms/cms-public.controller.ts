import {
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { CmsFacade } from './cms.facade';
import { QueryCmsPageDto } from './dto/query-cms-page.dto';

@ApiTags('cms')
@Controller({ path: 'cms', version: '1' })
export class CmsPublicController {
  constructor(private readonly facade: CmsFacade) {}

  @Get('homepage')
  @Public()
  @ApiOperation({ summary: 'Get homepage CMS content (sliders, banners, text)' })
  getHomepage() {
    return this.facade.getHomepage();
  }

  @Get('page/:slug')
  @Public()
  @ApiOperation({ summary: 'Get a CMS page by slug' })
  @ApiParam({ name: 'slug', example: 'about-us' })
  getPage(
    @Param('slug') slug: string,
    @Query() query: QueryCmsPageDto,
  ) {
    return this.facade.getPage({
      slug,
      platform: query.platform,
      locale: query.locale,
      preview: query.preview,
    });
  }

  @Get('page/:id/revisions')
  @Public()
  @ApiOperation({ summary: 'List page revision history' })
  getRevisions(@Param('id') id: string) {
    return this.facade.getPageRevisions(id);
  }

  @Get('navigation/:key')
  @Public()
  @ApiOperation({ summary: 'Get a navigation menu by key' })
  getNavigation(
    @Param('key') key: string,
    @Query('platform') platform?: 'ALL' | 'MOBILE' | 'WEB',
  ) {
    return this.facade.getNavigation(key, platform ?? 'ALL');
  }

  @Get('settings')
  @Public()
  @ApiOperation({ summary: 'Get global CMS settings' })
  getSettings() {
    return this.facade.getSettings();
  }
}
