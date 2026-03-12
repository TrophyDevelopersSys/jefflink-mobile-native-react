import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import MeiliSearch from 'meilisearch';

export type SearchIndex = 'vehicles' | 'properties';

@Injectable()
export class SearchService implements OnModuleInit {
  private readonly logger = new Logger(SearchService.name);
  private client!: MeiliSearch;
  private enabled = false;

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    const host = this.config.get<string>('MEILISEARCH_HOST');
    const apiKey = this.config.get<string>('MEILISEARCH_API_KEY');

    if (!host) {
      this.logger.warn('MEILISEARCH_HOST not set — search disabled');
      return;
    }

    this.client = new MeiliSearch({ host, apiKey });
    this.enabled = true;

    // Configure indexes
    await this.ensureIndex('vehicles', [
      'make', 'model', 'year', 'price', 'location', 'status',
    ]);
    await this.ensureIndex('properties', [
      'title', 'location', 'district', 'propertyType', 'price', 'bedrooms',
    ]);
  }

  private async ensureIndex(indexName: string, filterableAttributes: string[]) {
    try {
      await this.client.createIndex(indexName, { primaryKey: 'id' }).catch(() => {});
      const index = this.client.index(indexName);
      await index.updateFilterableAttributes(filterableAttributes);
      await index.updateSortableAttributes(['price', 'createdAt']);
    } catch (err) {
      this.logger.error(`Failed to configure index "${indexName}"`, err);
    }
  }

  async search(
    indexName: SearchIndex,
    query: string,
    options: {
      filter?: string;
      sort?: string[];
      page?: number;
      limit?: number;
    } = {},
  ) {
    if (!this.enabled) return { hits: [], total: 0, page: 1, limit: 20 };

    const { page = 1, limit = 20, filter, sort } = options;
    const index = this.client.index(indexName);

    const result = await index.search(query, {
      filter,
      sort,
      limit,
      offset: (page - 1) * limit,
    });

    return {
      hits: result.hits,
      total: result.estimatedTotalHits ?? 0,
      page,
      limit,
    };
  }

  async indexDocument(indexName: SearchIndex, document: Record<string, unknown>) {
    if (!this.enabled) return;
    await this.client.index(indexName).addDocuments([document]);
  }

  async deleteDocument(indexName: SearchIndex, id: string) {
    if (!this.enabled) return;
    await this.client.index(indexName).deleteDocument(id);
  }
}
