import { NextApiRequest } from 'next';
import { getToken } from 'next-auth/jwt';
import { extractCookie } from 'src/lib/extractCookie';
import { verifySignedValue } from '../helpers';
import { ImpersonationTypeEnum, impersonate } from './impersonateHelper';

jest.mock('next-auth/jwt', () => ({
  getToken: jest.fn(),
}));

const mockedGetToken = getToken as jest.MockedFn<typeof getToken>;

const impersonatorRoleCookie = (cookies: string[]): string | undefined =>
  extractCookie(cookies.join('; '), 'mpdx-handoff.impersonatorRole');

describe('impersonate', () => {
  const req = {
    method: 'POST',
    body: JSON.stringify({ user: 'target@cru.org', reason: 'Support' }),
  } as unknown as NextApiRequest;

  const mockApiResponse = (attributes: Record<string, unknown>) => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      json: jest
        .fn()
        .mockResolvedValue({ data: { type: 'impersonation', attributes } }),
    });
  };

  beforeEach(() => {
    process.env.REST_API_URL = 'https://api.example.com/api/v2/';
  });

  it('signs the impersonation role returned by the API', async () => {
    mockedGetToken.mockResolvedValue({
      apiToken: 'impersonator-token',
      userID: 'user-1',
      developer: false,
    } as never);
    mockApiResponse({
      json_web_token: 'impersonate-token',
      impersonation_role: 'hr_leader',
    });

    const { status, cookies } = await impersonate(
      req,
      ImpersonationTypeEnum.USER,
    );

    expect(status).toBe(200);
    expect(cookies).toContain(
      'mpdx-handoff.impersonate=impersonate-token; HttpOnly; Secure; path=/; Max-Age=300',
    );
    const signedRole = impersonatorRoleCookie(cookies);
    expect(signedRole).toBeDefined();
    expect(verifySignedValue(signedRole ?? '')).toBe('hr_leader');
    expect(cookies.join('; ')).not.toContain('isImpersonatorDeveloper');
  });

  it('falls back to developer when the API omits the role and the impersonator is a developer', async () => {
    mockedGetToken.mockResolvedValue({
      apiToken: 'impersonator-token',
      userID: 'user-1',
      developer: true,
    } as never);
    mockApiResponse({ json_web_token: 'impersonate-token' });

    const { cookies } = await impersonate(req, ImpersonationTypeEnum.USER);

    expect(verifySignedValue(impersonatorRoleCookie(cookies) ?? '')).toBe(
      'developer',
    );
  });

  it('sets no impersonator role cookie when the API omits the role and the impersonator is not a developer', async () => {
    mockedGetToken.mockResolvedValue({
      apiToken: 'impersonator-token',
      userID: 'user-1',
      developer: false,
    } as never);
    mockApiResponse({ json_web_token: 'impersonate-token' });

    const { cookies } = await impersonate(req, ImpersonationTypeEnum.USER);

    expect(impersonatorRoleCookie(cookies)).toBeUndefined();
    expect(cookies).toContain(
      'mpdx-handoff.impersonate=impersonate-token; HttpOnly; Secure; path=/; Max-Age=300',
    );
  });

  it('ignores an unknown role returned by the API', async () => {
    mockedGetToken.mockResolvedValue({
      apiToken: 'impersonator-token',
      userID: 'user-1',
      developer: false,
    } as never);
    mockApiResponse({
      json_web_token: 'impersonate-token',
      impersonation_role: 'bogus',
    });

    const { cookies } = await impersonate(req, ImpersonationTypeEnum.USER);

    expect(impersonatorRoleCookie(cookies)).toBeUndefined();
  });
});
