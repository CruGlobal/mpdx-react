import { createMocks } from 'node-mocks-http';
import jwt from 'next-auth/jwt';
import handoff from '../../../pages/api/handoff';

jest.mock('next-auth/jwt', () => ({}));

describe('/api/handoff', () => {
    beforeEach(() => {
        jwt.getToken = jest.fn();
    });

    it('returns 422', async () => {
        const { req, res } = createMocks({ method: 'GET' });
        await handoff(req, res);

        expect(res._getStatusCode()).toBe(422);
    });

    describe('session', () => {
        beforeEach(() => {
            jwt.getToken = jest.fn().mockReturnValue({ token: 'accessToken' });
        });

        it('returns redirect', async () => {
            const { req, res } = createMocks({
                method: 'GET',
                query: {
                    accountListId: 'accountListId',
                    userId: 'userId',
                    path: 'path',
                },
            });
            await handoff(req, res);

            expect(res._getStatusCode()).toBe(302);
            expect(res._getRedirectUrl()).toBe(
                'https://stage.mpdx.org/handoff?accessToken=accessToken&accountListId=accountListId&userId=userId&path=path',
            );
        });

        it('returns redirect for auth', async () => {
            const { req, res } = createMocks({
                method: 'GET',
                query: {
                    path: 'auth/user/admin',
                    auth: 'true',
                },
            });
            await handoff(req, res);

            expect(res._getStatusCode()).toBe(302);
            expect(res._getRedirectUrl()).toBe('https://auth.stage.mpdx.org/auth/user/admin?access_token=accessToken');
        });

        describe('SITE_URL set', () => {
            const OLD_ENV = process.env;

            beforeEach(() => {
                jest.resetModules();
                process.env = { ...OLD_ENV, SITE_URL: 'https://next.mpdx.org' };
            });

            afterAll(() => {
                process.env = OLD_ENV;
            });

            it('returns redirect', async () => {
                const { req, res } = createMocks({
                    method: 'GET',
                    query: {
                        accountListId: 'accountListId',
                        userId: 'userId',
                        path: 'path',
                    },
                });
                await handoff(req, res);

                expect(res._getStatusCode()).toBe(302);
                expect(res._getRedirectUrl()).toBe(
                    'https://mpdx.org/handoff?accessToken=accessToken&accountListId=accountListId&userId=userId&path=path',
                );
            });

            it('returns redirect for auth', async () => {
                const { req, res } = createMocks({
                    method: 'GET',
                    query: {
                        path: 'auth/user/admin',
                        auth: 'true',
                    },
                });
                await handoff(req, res);

                expect(res._getStatusCode()).toBe(302);
                expect(res._getRedirectUrl()).toBe('https://auth.mpdx.org/auth/user/admin?access_token=accessToken');
            });
        });
    });
});
