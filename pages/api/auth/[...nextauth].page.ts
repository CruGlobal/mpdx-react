import { NextApiRequest, NextApiResponse } from 'next';
import NextAuth, { DefaultSession, NextAuthOptions } from 'next-auth';
import { Provider } from 'next-auth/providers';
import OktaProvider from 'next-auth/providers/okta';
import client from '../../../src/lib/client';
import {
  OktaSignInDocument,
  OktaSignInMutation,
  OktaSignInMutationVariables,
} from './oktaSignIn.generated';
import {
  ApiOauthSignInDocument,
  ApiOauthSignInMutation,
  ApiOauthSignInMutationVariables,
} from './apiOauthSignIn';

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

if (
  process.env.USE_OKTA_OAUTH === 'true' &&
  (!process.env.OKTA_CLIENT_ID || !process.env.OKTA_CLIENT_SECRET)
) {
  throw new Error('OKTA_CLIENT_ID or OKTA_CLIENT_SECRET envs not defined');
}
if (
  process.env.USE_API_OAUTH === 'true' &&
  (!process.env.API_OAUTH_CLIENT_ID || !process.env.API_OAUTH_CLIENT_SECRET)
) {
  throw new Error(
    'API_OAUTH_CLIENT_ID or API_OAUTH_CLIENT_SECRET envs not defined',
  );
}

const providersArray: Provider[] = [];

if (process.env.USE_OKTA_OAUTH === 'true') {
  providersArray.push(
    OktaProvider({
      clientId: process.env.OKTA_CLIENT_ID ?? '0oa1n0gjoy3j5Ycdg0h8',
      clientSecret: process.env.OKTA_CLIENT_SECRET ?? '',
      issuer: process.env.OKTA_ISSUER ?? '',
      authorization: { params: { scope: 'openid email profile' } },
      token: { params: { scope: 'openid email profile' } },
      userinfo: { params: { scope: 'openid email profile' } },
    }),
  );
}

if (process.env.USE_API_OAUTH === 'true') {
  providersArray.push({
    id: 'apioauth',
    name: process.env.API_OAUTH_VISIBLE_NAME ?? 'SSO',
    type: 'oauth',
    clientId: process.env.API_OAUTH_CLIENT_ID ?? '',
    clientSecret: process.env.API_OAUTH_CLIENT_SECRET ?? '',
    authorization: {
      url: `${process.env.API_OAUTH_ISSUER}/oauth/authorize`,
      params: { scope: 'read write', response_type: 'code' },
    },
    token: {
      url: `${process.env.API_OAUTH_ISSUER}/oauth/token`,
      params: { scope: 'read write', response_type: 'code' },
    },
    userinfo: {
      async request() {
        // Our API doesn't use the auth/userInfo endpoint,  but NextAuth requires it to get the access token.
        // Since we pass the access_token to our API, which returns a JWT, user and authenicates via Graph QL
        // We can just return a object with hardcoded info, as it doesn't get used anywhere.
        return {
          sub: '83692',
          name: 'Alice Adams',
          given_name: 'Alice',
          family_name: 'Adams',
          email: 'alice.adams@gmail.cpm',
          picture: 'https://example.com/83692/photo.jpg',
        };
      },
    },
    idToken: false,
    profile(profile) {
      return {
        id: profile?.sub,
        email: profile?.email,
      };
    },
    checks: ['pkce', 'state'],
  });
}

const options: NextAuthOptions = {
  providers: providersArray,
  secret: process.env.JWT_SECRET,
  callbacks: {
    signIn: async ({ user, account }) => {
      const { access_token } = account;

      if (!access_token) {
        throw new Error(
          `${account.provider} sign in failed to return an access_token`,
        );
      }

      if (account.provider === 'apioauth') {
        const { data } = await client.mutate<
          ApiOauthSignInMutation,
          ApiOauthSignInMutationVariables
        >({
          mutation: ApiOauthSignInDocument,
          variables: {
            accessToken: access_token,
          },
        });

        if (data?.apiOauthSignIn?.token) {
          user.apiToken = data.apiOauthSignIn.token;
          return true;
        }
        throw new Error('ApiOauthSignIn mutation failed to return a token');
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
