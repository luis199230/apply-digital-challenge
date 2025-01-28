import { Injectable } from '@nestjs/common';
import {
  ContentfulClientApi,
  createClient,
  CreateClientParams,
} from 'contentful';

@Injectable()
export class ContentfulService {
  private contentfulClient: ContentfulClientApi<undefined>;

  constructor() {
    const clientParams: CreateClientParams = {
      space: process.env.CONTENTFUL_SPACE_ID || 'spaceId',
      accessToken: process.env.CONTENTFUL_ACCESS_TOKEN || 'accessToken',
      environment: process.env.CONTENTFUL_ENVIRONMENT || 'master',
    };

    this.contentfulClient = createClient(clientParams);
  }

  async getContentfulData(contentType: string, nextSyncToken?: string) {
    try {
      const response = await this.contentfulClient.sync({
        content_type: contentType,
        initial: !nextSyncToken ? true : undefined,
        nextSyncToken,
      });
      return response;
    } catch (e) {
      console.log(e);
    }
  }
}
