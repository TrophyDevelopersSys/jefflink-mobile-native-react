import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Optional,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const sharp: (input: Buffer) => import('sharp').Sharp = require('sharp');
import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';
import { DatabaseService } from '../../database/database.service';
import { mediaAssets } from '../../database/schema';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QUEUE_MEDIA } from '../../queue/queue.module';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor(
    private readonly config: ConfigService,
    private readonly db: DatabaseService,
    @Optional() @InjectQueue(QUEUE_MEDIA) private readonly mediaQueue: Queue | null,
  ) {
    const storageConfig = this.config.get('storage');
    this.bucket = storageConfig.bucket;
    this.publicUrl = (storageConfig.publicUrl ?? '').replace(/\/+$/, '');

    this.s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${storageConfig.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: storageConfig.accessKeyId,
        secretAccessKey: storageConfig.secretAccessKey,
      },
    });
  }

  /**
   * Generate a short-lived (5 min) presigned PUT URL so the client can upload
   * directly to R2 without routing the binary through the API server.
   *
   * Bucket key convention:
   *   cms/sliders/<uuid>.ext
   *   cars/<carId>/<uuid>.ext
   *   users/avatars/<userId>/<uuid>.ext
   *   vendors/<vendorId>/<uuid>.ext
   *   documents/<uuid>.ext
   *   uploads/<uuid>.ext  (generic / unscoped)
   */
  async presignUpload(path: string, contentType: string) {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'application/pdf'];
    if (!allowed.includes(contentType)) {
      throw new BadRequestException('Unsupported content type for presigned upload');
    }

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: path,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(this.s3, command, { expiresIn: 300 });
    const publicUrl = this.buildPublicUrl(path);

    return { uploadUrl, publicUrl, expiresIn: 300 };
  }

  async upload(
    file: Express.Multer.File,
    uploadedBy: string,
    entityType?: string,
    entityId?: string,
  ) {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('Unsupported file type');
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException('File too large (max 50 MB)');
    }

    const isImage = file.mimetype.startsWith('image/');
    const ext = isImage ? 'webp' : 'mp4';
    const key = `uploads/${randomUUID()}.${ext}`;

    let processedBuffer = file.buffer;

    // Compress image with sharp
    if (isImage) {
      processedBuffer = await sharp(file.buffer)
        .resize({ width: 1920, height: 1080, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer();
    }

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: processedBuffer,
        ContentType: isImage ? 'image/webp' : file.mimetype,
        Metadata: {
          uploadedBy,
          originalName: file.originalname,
        },
      }),
    );

    const [asset] = await this.db.db
      .insert(mediaAssets)
      .values({
        uploadedBy,
        bucket: this.bucket,
        key,
        url: key,
        mimeType: isImage ? 'image/webp' : file.mimetype,
        sizeBytes: processedBuffer.byteLength,
        referenceType: entityType,
        referenceId: entityId,
      })
      .returning();

    // Queue thumbnail generation (no-op when Redis is unavailable)
    if (isImage) {
      await this.enqueueJob('thumbnail', {
        type: 'thumbnail',
        payload: { assetId: asset.id, key, bucket: this.bucket },
      });
    }

    return this.toResponseAsset(asset);
  }

  async getSignedUrl(assetId: string, expiresIn = 3600) {
    const [asset] = await this.db.db
      .select()
      .from(mediaAssets)
      .where(eq(mediaAssets.id, assetId))
      .limit(1);

    if (!asset) throw new NotFoundException('Asset not found');

    const url = await getSignedUrl(
      this.s3,
      new GetObjectCommand({ Bucket: this.bucket, Key: asset.key }),
      { expiresIn },
    );

    return { url, expiresAt: new Date(Date.now() + expiresIn * 1000) };
  }

  async delete(assetId: string, requestedBy: string) {
    const [asset] = await this.db.db
      .select()
      .from(mediaAssets)
      .where(eq(mediaAssets.id, assetId))
      .limit(1);

    if (!asset) throw new NotFoundException('Asset not found');

    await this.enqueueJob('delete', {
      type: 'delete',
      payload: { key: asset.key, bucket: this.bucket },
    });

    await this.db.db
      .update(mediaAssets)
      .set({ status: 'DELETED' } as any)
      .where(eq(mediaAssets.id, assetId));
  }

  private async enqueueJob(name: string, payload: unknown): Promise<void> {
    if (!this.mediaQueue) return;

    try {
      await this.mediaQueue.add(name, payload);
    } catch (error) {
      this.logger.warn(
        `Failed to enqueue media job "${name}" (continuing without queue): ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  private buildPublicUrl(key: string): string {
    return `${this.publicUrl}/${key.replace(/^\/+/, '')}`;
  }

  private toResponseAsset<T extends { key: string; url: string; thumbnailUrl: string | null }>(asset: T) {
    return {
      ...asset,
      url: this.buildPublicUrl(asset.key),
      thumbnailUrl: asset.thumbnailUrl ? this.resolveStoredUrl(asset.thumbnailUrl) : null,
    };
  }

  private resolveStoredUrl(value: string): string {
    if (/^https?:\/\//i.test(value)) {
      return value;
    }

    return this.buildPublicUrl(value);
  }
}
