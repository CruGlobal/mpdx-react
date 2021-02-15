import { NextApiRequest, NextApiResponse } from 'next';
import NextAuth from 'next-auth';
import { Profile } from './profile';

const options = {
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
      profile: (profile: Profile): Profile => profile,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      state: false,
    },
  ],
  callbacks: {
    session: (session, token): Promise<unknown> => {
      return Promise.resolve({
        ...session,
        user: { ...session.user, token: token.token },
      });
    },
    jwt: async (token, user, _account, profile): Promise<unknown> => {
      if (user) {
        return Promise.resolve({ ...token, token: profile.token });
      } else {
        return Promise.resolve(token);
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
