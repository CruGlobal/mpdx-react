import { NextApiRequest, NextApiResponse } from 'next';
import NextAuth, { DefaultSession, NextAuthOptions } from 'next-auth';
import OktaProvider from 'next-auth/providers/okta';
import client from '../../../src/lib/client';
import {
  OktaSignInDocument,
  OktaSignInMutation,
  OktaSignInMutationVariables,
} from './oktaSignIn.generated';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      apiToken?: string;
    };
  }
  interface User {
    apiToken?: string;
  }
}

if (!process.env.OKTA_CLIENT_ID || !process.env.OKTA_CLIENT_SECRET) {
  throw new Error('OKTA_CLIENT_ID or OKTA_CLIENT_SECRET envs not defined');
}

const options: NextAuthOptions = {
  providers: [
    OktaProvider({
      clientId: process.env.OKTA_CLIENT_ID,
      clientSecret: process.env.OKTA_CLIENT_SECRET,
      issuer: process.env.OKTA_ISSUER,
      authorization: { params: { scope: 'openid email profile' } },
      token: { params: { scope: 'openid email profile' } },
      userinfo: { params: { scope: 'openid email profile' } },
    }),
  ],
  secret: process.env.JWT_SECRET,
  callbacks: {
    signIn: async ({ user, account }) => {
      const { access_token } = account;

      if (!access_token) {
        throw new Error('Okta sign in failed to return an access_token');
      }
      const { data } = await client.mutate<
        OktaSignInMutation,
        OktaSignInMutationVariables
      >({
        mutation: OktaSignInDocument,
        variables: {
          accessToken: access_token,
        },
      });
      if (data?.oktaSignIn?.token) {
        user.apiToken = data.oktaSignIn.token;
        return true;
      }
      throw new Error('oktaSignIn mutation failed to return a token');
    },
    jwt: ({ token, user }) => {
      if (user) {
        return { ...token, apiToken: user?.apiToken };
      } else {
        return token;
      }
    },
    session: ({ session, token }) => {
      return {
        ...session,
        user: { ...session.user, apiToken: token.apiToken as string },
      };
    },
  },
};

const Auth = (req: NextApiRequest, res: NextApiResponse): Promise<void> =>
  NextAuth(req, res, options);

export default Auth;
