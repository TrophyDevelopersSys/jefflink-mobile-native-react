import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFile,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { MediaService } from './media.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../../common/types/auth-user.type';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('media')
@ApiBearerAuth()
@Controller({ path: 'media', version: '1' })
export class MediaController {
  constructor(private readonly svc: MediaService) {}

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a media file (image or video)' })
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  upload(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: AuthUser,
    @Body('entityType') entityType?: string,
    @Body('entityId') entityId?: string,
  ) {
    if (!file) throw new BadRequestException('No file provided');
    return this.svc.upload(file, user.sub, entityType, entityId);
  }

  @Get(':id/signed-url')
  @ApiOperation({ summary: 'Get signed URL for a private asset' })
  getSignedUrl(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.getSignedUrl(id);
  }

  @Delete(':id')
  @Roles('ADMIN', 'MANAGER', 'SYSTEM_ADMIN', 'VENDOR', 'AGENT')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a media asset' })
  delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.svc.delete(id, user.sub);
  }
}
