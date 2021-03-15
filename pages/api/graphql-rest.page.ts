import { ApolloServer } from '@saeris/apollo-server-vercel';
import { buildFederatedSchema } from '@apollo/federation';
import { gql } from 'graphql-tag';
import { NextApiRequest } from 'next';
import {
  RequestOptions,
  Response,
  RESTDataSource,
} from 'apollo-datasource-rest';
import { Resolvers } from './graphql-rest.page.generated';

const typeDefs = gql`
  type Query {
    contactFilters(accountListId: ID!): [ContactFilter!]!
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
    contactFilters: async (_source, { accountListId }, { dataSources }) => {
      return dataSources.mpdxRestApi.getContactFilters(accountListId);
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

  async getContactFilters(accountListId) {
    const { data } = await this.get(
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
            : [default_selection],
      }),
    );
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
