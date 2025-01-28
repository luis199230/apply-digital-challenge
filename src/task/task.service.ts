import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EntrySkeletonType, SyncCollection } from 'contentful';

import { ProductService } from '../product/product.service';
import { ContentfulService } from '../contentful/contentful.service';
import { SyncLogService } from '../sync-log/sync-log.service';

type InputObject = Record<string, { 'en-US': unknown }>;
type OutputObject = Record<string, unknown>;

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  constructor(
    private readonly contentfulService: ContentfulService,
    private readonly productService: ProductService,
    private readonly syncLogService: SyncLogService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    this.logger.log('Cron job started');

    try {
      const latestSyncLog = await this.syncLogService.findLatest();
      const nextSyncToken = latestSyncLog
        ? (latestSyncLog.data as unknown as SyncCollection<EntrySkeletonType>)
            .nextSyncToken
        : undefined;

      const response = await this.contentfulService.getContentfulData(
        process.env.CONTENTFUL_PRODUCT_CONTENT_TYPE || 'product',
        nextSyncToken,
      );

      if (response) {
        await this.syncLogService.create(response as unknown as JSON);

        await this.processProducts(
          response as unknown as {
            entries: { fields: InputObject }[];
            deletedEntries: { fields: InputObject }[];
          },
        );
      }
    } catch (error) {
      this.logger.error('Cron job error', error);
    }

    this.logger.log('Cron job completed');
  }

  private async processProducts(response: {
    entries: { fields: InputObject }[];
    deletedEntries: { fields: InputObject }[];
  }) {
    const products = response?.entries.reduce(
      (acc: OutputObject[], curr: { fields: InputObject }) => {
        acc.push(this.convertObject(curr.fields));
        return acc;
      },
      [],
    );
    for (const product of products) {
      await this.productService.updateOrCreate(product);
    }

    const productsDeleted = response.deletedEntries.reduce(
      (acc: OutputObject[], curr: { fields: InputObject }) => {
        acc.push(this.convertObject(curr.fields));
        return acc;
      },
      [],
    );

    for (const productDeleted of productsDeleted) {
      await this.productService.updateDeleted(productDeleted);
    }
  }

  private convertObject(input: InputObject): OutputObject {
    const output: OutputObject = {};
    for (const key in input) {
      if (input[key]?.['en-US'] !== undefined) {
        output[key] = input[key]['en-US'];
      }
    }
    return output;
  }
}
