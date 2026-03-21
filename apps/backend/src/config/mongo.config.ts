import { registerAs } from '@nestjs/config';

export default registerAs('mongo', () => ({
  uri: process.env['MONGO_URI'] ?? '',
  dbName: process.env['MONGO_DB_NAME'] ?? 'jefflink',
  appName: process.env['MONGO_APP_NAME'] ?? 'jefflink-api',

  // Collection names (override via env for multi-tenant or test namespacing)
  collections: {
    cmsPages: process.env['MONGO_CMS_PAGES_COLLECTION'] ?? 'cms_pages',
    cmsPageRevisions: process.env['MONGO_CMS_PAGE_REVISIONS_COLLECTION'] ?? 'cms_page_revisions',
    cmsNavigation: process.env['MONGO_CMS_NAVIGATION_COLLECTION'] ?? 'cms_navigation',
    cmsSettings: process.env['MONGO_CMS_SETTINGS_COLLECTION'] ?? 'cms_settings',
    cmsMediaRefs: process.env['MONGO_CMS_MEDIA_REFS_COLLECTION'] ?? 'cms_media_refs',
    gpsLogs: process.env['MONGO_GPS_LOGS_COLLECTION'] ?? 'gps_logs',
    gpsLatest: process.env['MONGO_GPS_LATEST_COLLECTION'] ?? 'gps_latest',
    deviceRegistry: process.env['MONGO_DEVICE_REGISTRY_COLLECTION'] ?? 'device_registry',
    geofences: process.env['MONGO_GEOFENCES_COLLECTION'] ?? 'geofences',
    gpsAlerts: process.env['MONGO_GPS_ALERTS_COLLECTION'] ?? 'gps_alerts',
    documentAssets: process.env['MONGO_DOCUMENT_ASSETS_COLLECTION'] ?? 'document_assets',
    activityLogs: process.env['MONGO_ACTIVITY_LOGS_COLLECTION'] ?? 'activity_logs',
    notificationEvents: process.env['MONGO_NOTIFICATION_EVENTS_COLLECTION'] ?? 'notification_events',
  },

  // Feature flags – all default off so existing Neon CMS keeps working
  cmsAtlasEnabled: process.env['CMS_ATLAS_ENABLED'] === 'true',
  gpsAtlasEnabled: process.env['GPS_ATLAS_ENABLED'] === 'true',
  documentsAtlasEnabled: process.env['DOCUMENTS_ATLAS_ENABLED'] === 'true',
}));
