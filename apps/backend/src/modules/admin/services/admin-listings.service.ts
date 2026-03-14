import { Injectable, NotFoundException } from '@nestjs/common';
import { eq, desc, sql, and } from 'drizzle-orm';
import { DatabaseService } from '../../../database/database.service';
import { vehicles, properties, listingReports } from '../../../database/schema';
import type { AuditActor } from './audit-log.service';
import { AuditLogService } from './audit-log.service';

export type ListingModerationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type ReportStatus = 'OPEN' | 'RESOLVED' | 'DISMISSED';

@Injectable()
export class AdminListingsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditLogService,
  ) {}

  // ── Vehicles ──────────────────────────────────────────────────────────────

  async getPendingVehicles(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    return this.db.db
      .select()
      .from(vehicles)
      .where(eq(vehicles.status, 'PENDING_REVIEW'))
      .orderBy(desc(vehicles.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async approveVehicle(actor: AuditActor, vehicleId: string, note?: string) {
    const [existing] = await this.db.db
      .select({ id: vehicles.id, status: vehicles.status })
      .from(vehicles)
      .where(eq(vehicles.id, vehicleId))
      .limit(1);

    if (!existing) throw new NotFoundException(`Vehicle ${vehicleId} not found`);

    await this.db.db
      .update(vehicles)
      .set({ status: 'AVAILABLE', updatedAt: new Date() })
      .where(eq(vehicles.id, vehicleId));

    await this.audit.log(actor, 'APPROVE_VEHICLE', 'vehicle', vehicleId, {
      before: { status: existing.status },
      note,
    });

    return { id: vehicleId, status: 'AVAILABLE' };
  }

  async rejectVehicle(actor: AuditActor, vehicleId: string, reason: string) {
    const [existing] = await this.db.db
      .select({ id: vehicles.id, status: vehicles.status })
      .from(vehicles)
      .where(eq(vehicles.id, vehicleId))
      .limit(1);

    if (!existing) throw new NotFoundException(`Vehicle ${vehicleId} not found`);

    await this.db.db
      .update(vehicles)
      .set({ status: 'REJECTED', updatedAt: new Date() })
      .where(eq(vehicles.id, vehicleId));

    await this.audit.log(actor, 'REJECT_VEHICLE', 'vehicle', vehicleId, {
      before: { status: existing.status },
      reason,
    });

    return { id: vehicleId, status: 'REJECTED' };
  }

  // ── Properties ────────────────────────────────────────────────────────────

  async getPendingProperties(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    return this.db.db
      .select()
      .from(properties)
      .where(eq(properties.status, 'PENDING_REVIEW'))
      .orderBy(desc(properties.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async approveProperty(actor: AuditActor, propertyId: string, note?: string) {
    const [existing] = await this.db.db
      .select({ id: properties.id, status: properties.status })
      .from(properties)
      .where(eq(properties.id, propertyId))
      .limit(1);

    if (!existing) throw new NotFoundException(`Property ${propertyId} not found`);

    await this.db.db
      .update(properties)
      .set({ status: 'AVAILABLE', updatedAt: new Date() })
      .where(eq(properties.id, propertyId));

    await this.audit.log(actor, 'APPROVE_PROPERTY', 'property', propertyId, {
      before: { status: existing.status },
      note,
    });

    return { id: propertyId, status: 'AVAILABLE' };
  }

  async rejectProperty(actor: AuditActor, propertyId: string, reason: string) {
    const [existing] = await this.db.db
      .select({ id: properties.id, status: properties.status })
      .from(properties)
      .where(eq(properties.id, propertyId))
      .limit(1);

    if (!existing) throw new NotFoundException(`Property ${propertyId} not found`);

    await this.db.db
      .update(properties)
      .set({ status: 'REJECTED', updatedAt: new Date() })
      .where(eq(properties.id, propertyId));

    await this.audit.log(actor, 'REJECT_PROPERTY', 'property', propertyId, {
      before: { status: existing.status },
      reason,
    });

    return { id: propertyId, status: 'REJECTED' };
  }

  // ── Reports ───────────────────────────────────────────────────────────────

  async getReports(page = 1, limit = 20, status?: ReportStatus) {
    const offset = (page - 1) * limit;
    const conditions = status ? [eq(listingReports.status, status)] : [];

    return this.db.db
      .select()
      .from(listingReports)
      .where(and(...conditions))
      .orderBy(desc(listingReports.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async resolveReport(
    actor: AuditActor,
    reportId: string,
    resolution: ReportStatus,
    resolutionNote: string,
  ) {
    const [existing] = await this.db.db
      .select()
      .from(listingReports)
      .where(eq(listingReports.id, reportId))
      .limit(1);

    if (!existing) throw new NotFoundException(`Report ${reportId} not found`);

    await this.db.db
      .update(listingReports)
      .set({
        status: resolution,
        resolvedBy: actor.sub,
        resolutionNote,
        resolvedAt: new Date(),
      })
      .where(eq(listingReports.id, reportId));

    await this.audit.log(actor, `${resolution}_REPORT`, 'listing_report', reportId, {
      resolution,
      resolutionNote,
    });

    return { id: reportId, status: resolution };
  }

  async getListingCounts() {
    const [vehicles_count] = await this.db.db
      .select({ count: sql<number>`count(*)` })
      .from(vehicles);
    const [pending_count] = await this.db.db
      .select({ count: sql<number>`count(*)` })
      .from(vehicles)
      .where(eq(vehicles.status, 'PENDING_REVIEW'));
    const [open_reports] = await this.db.db
      .select({ count: sql<number>`count(*)` })
      .from(listingReports)
      .where(eq(listingReports.status, 'OPEN'));

    return {
      total: Number(vehicles_count?.count ?? 0),
      pending: Number(pending_count?.count ?? 0),
      openReports: Number(open_reports?.count ?? 0),
    };
  }
}
