import { ApolloServer } from 'apollo-server-micro';
import { PageConfig, NextApiRequest } from 'next';
import Cors from 'micro-cors';
import { ApolloGateway, RemoteGraphQLDataSource } from '@apollo/gateway';
import { getToken } from 'next-auth/jwt';

class AuthenticatedDataSource extends RemoteGraphQLDataSource {
  willSendRequest({
    request,
    context,
  }: Parameters<
    NonNullable<InstanceType<typeof RemoteGraphQLDataSource>['willSendRequest']>
  >[0]) {
    try {
      if (context.apiToken) {
        request?.http?.headers.set(
          'Authorization',
          `Bearer ${context.apiToken}`,
        );
      }
    } catch (e) {
      console.error('Error adding Authorization header', e);
    }
  }
}

const gateway = new ApolloGateway({
  serviceList: [
    { name: 'graphql', url: process.env.API_URL },
    { name: 'rest', url: `${process.env.SITE_URL}/api/graphql-rest` },
  ],
  buildService({ url }) {
    return new AuthenticatedDataSource({ url });
  },
});

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET env var is not set');
}

const cors = Cors({
  origin: 'https://studio.apollographql.com',
  allowCredentials: true,
});

const apolloServer = new ApolloServer({
  gateway,
  playground: {
    settings: {
      'request.credentials': 'same-origin',
    },
  },
  introspection: true,
  subscriptions: false,
  context: async ({ req }: { req: NextApiRequest }) => {
    const jwtToken = (await getToken({
      req,
      secret: process.env.JWT_SECRET as string,
    })) as { apiToken: string } | null;

    return { apiToken: jwtToken?.apiToken };
  },
});
const startServer = apolloServer.start();

export default cors(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.end();
    return false;
  }
  await startServer;
  await apolloServer.createHandler({
    path: '/api/graphql',
  })(req, res);
});
// Apollo Server Micro takes care of body parsing
export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};
