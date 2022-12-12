import { NextApiRequest, NextApiResponse } from 'next';
import NextAuth, { DefaultSession, NextAuthOptions } from 'next-auth';
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
} from './apiOauthSignIn.generated';

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
    {
      id: 'apioauth', //
      name: '0Auth',
      type: 'oauth',
      clientId: process.env.API_OAUTH_CLIENT_ID,
      clientSecret: process.env.API_OAUTH_CLIENT_SECRET,
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
            email: 'someone.else@hotmail.cpm',
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
    },
  ],
  secret: process.env.JWT_SECRET,
  callbacks: {
    signIn: async ({ user, account }) => {
      const { access_token } = account;
      console.log('SignIn 1', account);
      // Here you need to access our server to access the JWT
      if (!access_token) {
        throw new Error(
          `${account.provider} sign in failed to return an access_token`,
        );
      }
      console.log('SignIn 2', user);

      if (account.provider === 'auth0') {
        const { data } = await client.mutate<
          ApiOauthSignInMutation,
          ApiOauthSignInMutationVariables
        >({
          mutation: ApiOauthSignInDocument,
          variables: {
            accessToken: access_token,
          },
        });
        console.log('SignIn 3', data);

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
