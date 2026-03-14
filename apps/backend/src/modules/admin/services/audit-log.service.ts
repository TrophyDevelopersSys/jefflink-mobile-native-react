import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { adminLogs } from '../../../database/schema';
import type { AppRole } from '../../../common/decorators/roles.decorator';

export interface AuditActor {
  sub: string;
  role: AppRole;
  ipAddress?: string;
}

@Injectable()
export class AuditLogService {
  constructor(private readonly db: DatabaseService) {}

  async log(
    actor: AuditActor,
    action: string,
    entityType?: string,
    entityId?: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    await this.db.db.insert(adminLogs).values({
      adminId: actor.sub,
      action,
      entityType,
      entityId,
      metadata,
      ipAddress: actor.ipAddress,
    });
  }
}
