import { NextApiRequest, NextApiResponse } from 'next';
import NextAuth, { NextAuthOptions } from 'next-auth';
import getConfig from 'next/config';
import { Profile } from './profile.page';

const { serverRuntimeConfig } = getConfig();
process.env.NEXTAUTH_URL = serverRuntimeConfig.NEXTAUTH_URL;

declare module 'next-auth' {
  interface Session {
    user: {
      token?: string;
    };
  }
  interface User {
    token?: string;
  }
}

const options: NextAuthOptions = {
  providers: [
    {
      id: 'thekey',
      name: 'The Key',
      type: 'oauth',
      version: '2.0',
      scope: 'fullticket',
      params: { grant_type: 'authorization_code' },
      accessTokenUrl: 'https://thekey.me/cas/api/oauth/token',
      authorizationUrl: 'https://thekey.me/cas/login?response_type=code',
      profileUrl: `${process.env.SITE_URL}/api/auth/profile`,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      profile: (profile: Profile): Profile => profile,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      state: false,
    },
  ],
  callbacks: {
    session: async ({ session, user }) => {
      return {
        ...session,
        user: { ...session.user, token: user.token },
      };
    },
    jwt: async ({ token, user, profile }) => {
      if (user) {
        return { ...token, token: profile?.token };
      } else {
        return token;
      }
    },
  },
  jwt: {
    secret: process.env.JWT_SECRET,
  },
};

const Auth = (req: NextApiRequest, res: NextApiResponse): Promise<void> =>
  NextAuth(req, res, options);

export default Auth;
