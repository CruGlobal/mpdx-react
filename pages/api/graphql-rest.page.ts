import { ApolloServer } from '@saeris/apollo-server-vercel';
import { buildFederatedSchema } from '@apollo/federation';
import { NextApiRequest } from 'next';
import {
  RequestOptions,
  Response,
  RESTDataSource,
} from 'apollo-datasource-rest';
import {
  ExportFormatEnum,
  ExportLabelTypeEnum,
  ExportSortEnum,
} from '../../graphql/types.generated';
import {
  ContactFilterOption,
  ContactFilterGroup,
  ContactFilter,
} from './graphql-rest.page.generated';
import ContactFiltersResolvers from './Schema/ContactFilters/resolvers';
import TaskAnalyticsResolvers from './Schema/TaskAnalytics/resolvers';
import ExportContactsResolvers from './Schema/ExportContacts/resolvers';
import ContactFiltersTypeDefs from './Schema/ContactFilters/typeDefs';
import TaskAnalyticsTypeDefs from './Schema/TaskAnalytics/typeDefs';
import ExportContactsTypeDefs from './Schema/ExportContacts/typeDefs';

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

    const groups: { [name: string]: ContactFilterGroup } = {};
    const createFilterGroup: (parent: string) => ContactFilterGroup = (
      parent,
    ) => {
      return {
        id: parent,
        title: parent,
        alwaysVisible: false,
        filters: [],
      };
    };

    const response: ContactFilterGroup[] = [];
    data.forEach(
      ({
        id,
        attributes: { default_selection, parent, title, ...attributes },
      }) => {
        const filter: ContactFilter = {
          id: id,
          title: title,
          ...attributes,
          defaultSelection:
            typeof default_selection === 'string'
              ? default_selection.split(/,\s?/)
              : [default_selection.toString()],
        };

        if (parent) {
          if (!groups[parent]) {
            groups[parent] = createFilterGroup(parent);
            response.push(groups[parent]);
          }
          groups[parent].filters.push(filter);
        } else {
          const group = createFilterGroup(title);
          response.push(group);
          group.filters.push(filter);
        }
      },
    );
    return response;
  }

  async getTaskAnalytics(accountListId: string) {
    const { data } = await this.get(
      `tasks/analytics?filter[account_list_id]=${accountListId}`,
    );

    const {
      attributes: {
        created_at,
        last_electronic_newsletter_completed_at,
        last_physical_newsletter_completed_at,
        tasks_overdue_or_due_today_counts,
        total_tasks_due_count,
        updated_at,
        updated_in_db_at,
      },
    } = data;

    return {
      ...data,
      createdAt: created_at,
      lastElectronicNewsletterCompletedAt: last_electronic_newsletter_completed_at,
      lastPhysicalNewsletterCompletedAt: last_physical_newsletter_completed_at,
      tasksOverdueOrDueTodayCounts: tasks_overdue_or_due_today_counts,
      totalTasksDueCount: total_tasks_due_count,
      updatedAt: updated_at,
      updatedInDbAt: updated_in_db_at,
    };
  }
}

export interface Context {
  authHeader: string;
  dataSources: { mpdxRestApi: MpdxRestApi };
}

const server = new ApolloServer({
  schema: buildFederatedSchema([
    { typeDefs: ContactFiltersTypeDefs, resolvers: ContactFiltersResolvers },
    { typeDefs: TaskAnalyticsTypeDefs, resolvers: TaskAnalyticsResolvers },
    { typeDefs: ExportContactsTypeDefs, resolvers: ExportContactsResolvers },
  ]),
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
