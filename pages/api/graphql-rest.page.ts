import { ApolloServer } from '@saeris/apollo-server-vercel';
import { buildFederatedSchema } from '@apollo/federation';
import { gql } from 'graphql-tag';
import { NextApiRequest } from 'next';
import {
  RequestOptions,
  Response,
  RESTDataSource,
} from 'apollo-datasource-rest';
import { ContactFilterOption, Resolvers } from './graphql-rest.page.generated';

const typeDefs = gql`
  type Query {
    contactFilters(accountListId: ID!): [ContactFilter!]!
    taskAnalytics(accountListId: ID!): TaskAnalytics!
  }

  type TaskAnalytics {
    id: ID!
    type: String!
    createdAt: ISO8601DateTime!
    lastElectronicNewsletterCompletedAt: ISO8601DateTime
    lastPhysicalNewsletterCompletedAt: ISO8601DateTime
    tasksOverdueOrDueTodayCounts: [OverdueOrDueTodayTaskAnalytic!]!
    totalTasksDueCount: Int!
    updatedAt: ISO8601DateTime!
    updatedInDbAt: ISO8601DateTime!
  }

  scalar ISO8601DateTime

  type OverdueOrDueTodayTaskAnalytic {
    label: String!
    count: Int!
  }

  type ContactFilter {
    id: ID!
    type: String!
    filterType: String!
    defaultSelection: [String]!
    featured: Boolean!
    multiple: Boolean!
    name: String!
    options: [ContactFilterOption!]!
    parent: String
    title: String!
  }

  type ContactFilterOption {
    id: String
    name: String!
    placeholder: String
  }
`;

const resolvers: Resolvers = {
  Query: {
    contactFilters: (_source, { accountListId }, { dataSources }) => {
      return dataSources.mpdxRestApi.getContactFilters(accountListId);
    },
    taskAnalytics: async (_source, { accountListId }, { dataSources }) => {
      return dataSources.mpdxRestApi.getTaskAnalytics(accountListId);
    },
  },
};

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
    return data.map(
      ({
        attributes: { type, default_selection, ...attributes },
        ...filter
      }) => ({
        ...filter,
        ...attributes,
        filterType: type,
        defaultSelection:
          typeof default_selection === 'string'
            ? default_selection.split(/,\s?/)
            : [default_selection.toString()],
      }),
    );
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
  schema: buildFederatedSchema([{ typeDefs, resolvers }]),
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
