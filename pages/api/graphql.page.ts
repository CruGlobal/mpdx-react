import { ApolloServer } from '@saeris/apollo-server-vercel';
import { ApolloGateway, RemoteGraphQLDataSource } from '@apollo/gateway';
import jwt from 'next-auth/jwt';
import { NextApiRequest } from 'next';

class AuthenticatedDataSource extends RemoteGraphQLDataSource {
  async willSendRequest({ request, context }) {
    try {
      if (context.jwtToken) {
        request.http.headers.set('Authorization', `Bearer ${context.jwtToken}`);
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

const server = new ApolloServer({
  gateway,
  playground: {
    settings: {
      'request.credentials': 'same-origin',
    },
  },
  introspection: true,
  subscriptions: false,
  context: async ({ req }: { req: NextApiRequest }) => {
    const jwtToken = (await jwt.getToken({
      req,
      secret: process.env.JWT_SECRET,
    })) as null | { token: string };

    return { jwtToken: jwtToken?.token };
  },
});

export default server.createHandler();
