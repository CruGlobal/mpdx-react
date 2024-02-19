import { getToken } from 'next-auth/jwt';
import makeSsrClient from 'src/lib/apollo/ssrClient';
import { returnRedirectUrl } from './handoff.page';

jest.mock('next-auth/jwt', () => ({ getToken: jest.fn() }));
jest.mock('src/lib/apollo/ssrClient', () => jest.fn());

const rewriteDomain = 'rewrite-domain.org';
const queryPath = 'pathName';
const apiToken = 'apiToken';
const userID = 'userID';
const accountListId = 'accountListId';
const defaultAccountList = 'defaultAccountList';
process.env.REWRITE_DOMAIN = rewriteDomain;

describe('Handoff', () => {
  const nextApiRequest = {
    query: {
      path: queryPath,
    },
  } as any;

  describe('Errors', () => {
    it('returns an error if getToken throws an error', () => {
      (getToken as jest.Mock).mockRejectedValueOnce(
        new Error('NextAuth authenication error'),
      );
      // eslint-disable-next-line jest/valid-expect
      expect(async () => {
        await returnRedirectUrl(nextApiRequest);
      }).rejects.toThrow('NextAuth authenication error');
    });

    it('returns an error if getToken is not defined', () => {
      (getToken as jest.Mock).mockReturnValue(null);
      // eslint-disable-next-line jest/valid-expect
      expect(async () => {
        await returnRedirectUrl(nextApiRequest);
      }).rejects.toThrow(
        'Something went wrong. jwtToken or auth are undefined',
      );
    });
  });

  describe('Authenicated', () => {
    beforeEach(() => {
      (getToken as jest.Mock).mockReturnValue({
        apiToken,
        userID,
      });
    });

    describe('Redirect to Auth website', () => {
      it('should return auth website with path and access token', async () => {
        nextApiRequest.query.auth = 'true';
        const redirectUrl = await returnRedirectUrl(nextApiRequest);

        expect(redirectUrl).toEqual(
          `https://auth.${rewriteDomain}/${queryPath}?access_token=${apiToken}`,
        );
      });
    });

    describe('Redirect to old MPDx website', () => {
      beforeEach(() => {
        (makeSsrClient as jest.Mock).mockReturnValue({
          query: jest.fn().mockReturnValue({
            data: {
              accountLists: {
                nodes: [{ id: accountListId }],
              },
              user: {
                defaultAccountList,
              },
            },
          }),
        });
        nextApiRequest.query.auth = 'false';
      });

      it('redirects to the old MPDx website', async () => {
        nextApiRequest.query.accountListId = `${accountListId}-1`;
        const redirectUrl = await returnRedirectUrl(nextApiRequest);

        expect(redirectUrl).toEqual(
          `https://${rewriteDomain}/handoff?accessToken=${apiToken}&accountListId=${accountListId}-1&userId=${userID}&path=${queryPath}`,
        );
      });

      it("should grab the user's defaultAccountList if query.accountListId is undefined", async () => {
        nextApiRequest.query.accountListId = undefined;
        const redirectUrl = await returnRedirectUrl(nextApiRequest);

        expect(redirectUrl).toEqual(
          `https://${rewriteDomain}/handoff?accessToken=${apiToken}&accountListId=${defaultAccountList}&userId=${userID}&path=${queryPath}`,
        );
      });

      it("should grab the user's first accountLists if query.accountListId and defaultAccountList are undefined", async () => {
        (makeSsrClient as jest.Mock).mockReturnValue({
          query: jest.fn().mockReturnValue({
            data: {
              accountLists: {
                nodes: [{ id: accountListId }],
              },
              user: {
                defaultAccountList: undefined,
              },
            },
          }),
        });

        nextApiRequest.query.accountListId = undefined;
        const redirectUrl = await returnRedirectUrl(nextApiRequest);

        expect(redirectUrl).toEqual(
          `https://${rewriteDomain}/handoff?accessToken=${apiToken}&accountListId=${accountListId}&userId=${userID}&path=${queryPath}`,
        );
      });
    });
  });
});
