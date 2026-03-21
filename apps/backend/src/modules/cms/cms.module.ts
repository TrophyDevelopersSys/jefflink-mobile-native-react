import { Module } from '@nestjs/common';
import { CmsService } from './cms.service';
import { CmsController } from './cms.controller';
import { CmsPublicController } from './cms-public.controller';
import { CmsAdminController } from './cms-admin.controller';
import { CmsFacade } from './cms.facade';
import { CmsAtlasStore } from './stores/cms-atlas.store';
import { CmsNeonStore } from './stores/cms-neon.store';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [AdminModule],
  providers: [CmsService, CmsFacade, CmsAtlasStore, CmsNeonStore],
  controllers: [CmsController, CmsPublicController, CmsAdminController],
  exports: [CmsService, CmsFacade],
})
export class CmsModule {}
