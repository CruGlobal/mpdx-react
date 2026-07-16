import { NextApiRequest } from 'next';
import { getToken } from 'next-auth/jwt';
import { createMocks } from 'node-mocks-http';
import { verifySignedValue } from '../helpers';
import { ImpersonationTypeEnum, impersonate } from './impersonateHelper';

jest.mock('next-auth/jwt', () => ({
  getToken: jest.fn(),
}));

const impersonationScopeCookiePrefix = 'mpdx-handoff.impersonationScope=';

const makeRequest = (): NextApiRequest => {
  const { req } = createMocks({ method: 'POST' });
  const request = req as unknown as NextApiRequest;
  // The impersonate helper expects a JSON string body, but createMocks only accepts objects
  request.body = JSON.stringify({
    user: 'impersonated.user@cru.org',
    reason: 'Helpscout Ticket',
  });
  return request;
};

const mockFetch = (attributes: Record<string, string>) => {
  global.fetch = jest.fn().mockResolvedValue({
    status: 200,
    json: jest.fn().mockResolvedValue({
      data: {
        type: 'impersonation',
        attributes: {
          created_at: '2024-01-01T00:00:00Z',
          json_web_token: 'impersonation-jwt',
          updated_at: '2024-01-01T00:00:00Z',
          updated_in_db_at: '2024-01-01T00:00:00Z',
          ...attributes,
        },
      },
    }),
  });
};

describe('impersonate', () => {
  beforeEach(() => {
    process.env.REST_API_URL = 'https://api.stage.mpdx.org/api/v2/';
    (getToken as jest.Mock).mockResolvedValue({
      apiToken: 'api-token',
      userID: 'user-1',
      developer: false,
    });
  });

  it('sets the impersonationScope cookie when the API response includes impersonation_scope', async () => {
    mockFetch({ impersonation_scope: 'mpd_leader' });

    const { status, cookies } = await impersonate(
      makeRequest(),
      ImpersonationTypeEnum.USER,
    );

    expect(status).toBe(200);
    const scopeCookie = cookies.find((cookie) =>
      cookie.startsWith(impersonationScopeCookiePrefix),
    );
    expect(scopeCookie).toBeDefined();
    const signedScope = (scopeCookie as string)
      .slice(impersonationScopeCookiePrefix.length)
      .split(';')[0];
    expect(verifySignedValue(signedScope)).toBe('mpd_leader');
    expect(scopeCookie).toContain('HttpOnly; Secure; path=/; Max-Age=300');
  });

  it('does not set the impersonationScope cookie when impersonation_scope is absent', async () => {
    mockFetch({});

    const { status, cookies } = await impersonate(
      makeRequest(),
      ImpersonationTypeEnum.USER,
    );

    expect(status).toBe(200);
    expect(
      cookies.some((cookie) =>
        cookie.startsWith(impersonationScopeCookiePrefix),
      ),
    ).toBe(false);
    // The other impersonation cookies are still set
    expect(
      cookies.some((cookie) => cookie.startsWith('mpdx-handoff.impersonate=')),
    ).toBe(true);
  });
});
