import { ApolloServer } from '@saeris/apollo-server-vercel';
import { buildFederatedSchema } from '@apollo/federation';
import { gql } from 'graphql-tag';
import { NextApiRequest } from 'next';
import { RESTDataSource } from 'apollo-datasource-rest';

const typeDefs = gql`
  type Query {
    contactFilters(accountListId: String): [ContactFilter!]!
  }

  type ContactFilter {
    id: ID!
    type: String!
    filterType: String!
    default_selection: Boolean!
    featured: Boolean!
    multiple: Boolean!
    name: String!
    options: [String!]!
    parent: String!
    title: String!
  }
`;

const resolvers = {
  Query: {
    testTypeFromNextJs() {
      return { id: '1' };
    },
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

  willSendRequest(request) {
    request.headers.set('Authorization', this.context.authHeader);
    request.headers.set('content-type', 'application/vnd.api+json');
  }

  async getContactFilters(accountListId) {
    return this.get(
      `contacts/filters?filter[account_list_id]=${accountListId}`,
    );
  }
}

const server = new ApolloServer({
  schema: buildFederatedSchema([{ typeDefs, resolvers }]),
  dataSources: () => {
    return {
      mpdxRestApi: new MpdxRestApi(),
    };
  },
  context: async ({ req }: { req: NextApiRequest }) => {
    return { authHeader: req.headers.authorization };
  },
});

export default server.createHandler();
