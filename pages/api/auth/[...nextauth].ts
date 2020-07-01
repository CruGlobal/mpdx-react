import NextAuth from 'next-auth';
import { Profile } from './profile';

const options = {
    site: process.env.VERCEL_URL,
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
            profileUrl: `${process.env.VERCEL_URL}/api/auth/profile`,
            profile: (profile: Profile): Profile => profile,
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
        },
    ],
    callbacks: {
        jwt: async (payload, profile: Profile): Promise<any> => {
            if (profile) {
                return Promise.resolve({ ...payload, user: profile });
            } else {
                return Promise.resolve(payload);
            }
        },
    },
    jwt: {
        secret: process.env.JWT_SECRET,
    },
};

const Auth = (req, res): void => NextAuth(req, res, options);

export default Auth;
