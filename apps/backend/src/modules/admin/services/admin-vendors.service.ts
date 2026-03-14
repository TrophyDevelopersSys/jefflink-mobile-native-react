import { Injectable, NotFoundException } from '@nestjs/common';
import { eq, desc, sql } from 'drizzle-orm';
import { DatabaseService } from '../../../database/database.service';
import {
  users,
  vehicles,
  vendorProfiles,
  contracts,
  payments,
  adminLogs,
} from '../../../database/schema';
import type { AuditActor } from './audit-log.service';
import { AuditLogService } from './audit-log.service';

@Injectable()
export class AdminVendorsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditLogService,
  ) {}

  async listVendors(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    return this.db.db
      .select({
        id: vendorProfiles.id,
        userId: vendorProfiles.userId,
        businessName: vendorProfiles.businessName,
        businessType: vendorProfiles.businessType,
        location: vendorProfiles.location,
        verificationStatus: vendorProfiles.verificationStatus,
        createdAt: vendorProfiles.createdAt,
      })
      .from(vendorProfiles)
      .orderBy(desc(vendorProfiles.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getVendorDetail(vendorProfileId: string) {
    const [profile] = await this.db.db
      .select()
      .from(vendorProfiles)
      .where(eq(vendorProfiles.id, vendorProfileId))
      .limit(1);

    if (!profile) throw new NotFoundException(`Vendor profile ${vendorProfileId} not found`);

    const [user] = await this.db.db
      .select({ id: users.id, email: users.email, name: users.name, status: users.status })
      .from(users)
      .where(eq(users.id, profile.userId))
      .limit(1);

    const listingCount = await this.db.db
      .select({ count: sql<number>`count(*)` })
      .from(vehicles)
      .where(eq(vehicles.vendorId, profile.userId));

    return { profile, user, listingCount: Number(listingCount[0]?.count ?? 0) };
  }

  async verifyVendor(actor: AuditActor, vendorProfileId: string, note?: string) {
    const [existing] = await this.db.db
      .select()
      .from(vendorProfiles)
      .where(eq(vendorProfiles.id, vendorProfileId))
      .limit(1);

    if (!existing) throw new NotFoundException(`Vendor profile ${vendorProfileId} not found`);

    await this.db.db
      .update(vendorProfiles)
      .set({
        verificationStatus: 'VERIFIED',
        verifiedBy: actor.sub,
        verifiedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(vendorProfiles.id, vendorProfileId));

    await this.audit.log(actor, 'VERIFY_VENDOR', 'vendor', vendorProfileId, {
      before: { status: existing.verificationStatus },
      note,
    });

    return { id: vendorProfileId, verificationStatus: 'VERIFIED' };
  }

  async suspendVendor(actor: AuditActor, vendorProfileId: string, reason: string) {
    const [existing] = await this.db.db
      .select()
      .from(vendorProfiles)
      .where(eq(vendorProfiles.id, vendorProfileId))
      .limit(1);

    if (!existing) throw new NotFoundException(`Vendor profile ${vendorProfileId} not found`);

    await this.db.db
      .update(vendorProfiles)
      .set({ verificationStatus: 'SUSPENDED', updatedAt: new Date() })
      .where(eq(vendorProfiles.id, vendorProfileId));

    await this.audit.log(actor, 'SUSPEND_VENDOR', 'vendor', vendorProfileId, {
      before: { status: existing.verificationStatus },
      reason,
    });

    return { id: vendorProfileId, verificationStatus: 'SUSPENDED' };
  }

  async getVendorCount(): Promise<number> {
    const [row] = await this.db.db
      .select({ count: sql<number>`count(*)` })
      .from(vendorProfiles);
    return Number(row?.count ?? 0);
  }
}
