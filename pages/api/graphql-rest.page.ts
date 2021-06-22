import { ApolloServer } from '@saeris/apollo-server-vercel';
import { NextApiRequest } from 'next';
import {
  RequestOptions,
  Response,
  RESTDataSource,
} from 'apollo-datasource-rest';
import { DateTime, Duration, Interval } from 'luxon';
import {
  ExportFormatEnum,
  ExportLabelTypeEnum,
  ExportSortEnum,
} from '../../graphql/types.generated';
import {
  ContactFilterOption,
  FourteenMonthReportCurrencyType,
} from './graphql-rest.page.generated';
import schema from './Schema';
import { getTaskAnalytics } from './Schema/TaskAnalytics/dataHandler';
import { getContactFilters } from './Schema/ContactFilters/datahandler';
import {
  CoachingAnswerSetResponse,
  getCoachingAnswerSets,
} from './Schema/CoachingAnswerSets/dataHandler';
import {
  FourteenMonthReportResponse,
  mapFourteenMonthReport,
} from './Schema/reports/fourteenMonth/datahandler';

class MpdxRestApi extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = process.env.REST_API_URL;
  }

  willSendRequest(request: RequestOptions) {
    request.headers.set('Authorization', this.context.authHeader);
    request.headers.set('content-type', 'application/vnd.api+json');
  }

  // Overridden to accept JSON API Content Type application/vnd.api+json
  // Taken from https://github.com/apollographql/apollo-server/blob/baf9b252dfab150ec828ef83345a7ceb2d34a6a3/packages/apollo-datasource-rest/src/RESTDataSource.ts#L110-L126
  protected parseBody(
    response: Response,
  ): Promise<Record<string, unknown> | string> {
    const contentType = response.headers.get('Content-Type');
    const contentLength = response.headers.get('Content-Length');
    if (
      // As one might expect, a "204 No Content" is empty! This means there
      // isn't enough to `JSON.parse`, and trying will result in an error.
      response.status !== 204 &&
      contentLength !== '0' &&
      contentType &&
      (contentType.startsWith('application/json') ||
        contentType.startsWith('application/vnd.api+json') ||
        contentType.startsWith('application/hal+json'))
    ) {
      return response.json();
    } else {
      return response.text();
    }
  }

  async createExportedContacts(
    mailing: boolean,
    format: ExportFormatEnum,
    filter: {
      account_list_id: string;
      newsletter: string;
      status: string;
    },
    labelType?: ExportLabelTypeEnum | null,
    sort?: ExportSortEnum | null,
  ) {
    const pathAddition = mailing ? '/mailing' : '';

    const { data } = await this.post(`contacts/exports${pathAddition}`, {
      data: {
        attributes: {
          params: {
            filter,
            type: labelType,
            sort,
          },
        },
        type: 'export_logs',
      },
    });

    return `${process.env.REST_API_URL}contacts/exports${pathAddition}/${data.id}.${format}`;
  }

  async getContactFilters(accountListId: string) {
    const {
      data,
    }: {
      data: {
        id: string;
        type: string;
        attributes: {
          type: string;
          default_selection: string | boolean;
          featured: boolean;
          multiple: boolean;
          name: string;
          options: ContactFilterOption[];
          parent: string;
          title: string;
        };
      }[];
    } = await this.get(
      `contacts/filters?filter[account_list_id]=${accountListId}`,
    );

    return getContactFilters(data);
  }

  async getTaskAnalytics(accountListId: string) {
    const { data } = await this.get(
      `tasks/analytics?filter[account_list_id]=${accountListId}`,
    );

    return getTaskAnalytics(data);
  }

  async getCoachingAnswerSets(accountListId: string) {
    const { data }: { data: CoachingAnswerSetResponse[] } = await this.get(
      `coaching/answer_sets?filter[account_list_id]=${accountListId}`,
    );

    return getCoachingAnswerSets(data);
  }

  async getFourteenMonthReport(
    accountListId: string,
    currencyType: FourteenMonthReportCurrencyType,
  ) {
    const { data }: { data: FourteenMonthReportResponse } = await this.get(
      `reports/${
        currencyType === 'salary'
          ? 'salary_currency_donations'
          : 'donor_currency_donations'
      }?filter[account_list_id]=${accountListId}&filter[month_range]=${Interval.before(
        DateTime.now().endOf('month'),
        Duration.fromObject({ months: 14 }).minus({ day: 1 }),
      )
        .toISODate()
        .replace('/', '...')}`,
    );
    return mapFourteenMonthReport(data, currencyType);
  }
}

export interface Context {
  authHeader: string;
  dataSources: { mpdxRestApi: MpdxRestApi };
}

const server = new ApolloServer({
  schema,
  dataSources: () => {
    return {
      mpdxRestApi: new MpdxRestApi(),
    };
  },
  context: ({ req }: { req: NextApiRequest }): Partial<Context> => {
    return { authHeader: req.headers.authorization };
  },
});

export default server.createHandler();
