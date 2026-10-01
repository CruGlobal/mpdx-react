import { NextApiRequest, NextApiResponse } from 'next';
import { NextAuthOptions, Session } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import { setUserInfo } from 'pages/api/auth/helpers';
import { expireCookieDefaultInfo } from 'pages/api/utils/cookies';

const mockNextAuth = jest.fn();
jest.mock('next-auth', () => ({
  __esModule: true,
  default: (...args: unknown[]) => mockNextAuth(...args),
}));

// User One
const userOneId = 'userId_1';
const userOneToken = 'userOne.token';
const userOneImpersonate = 'userOne.impersonate.token';

// User Two
const userTwoId = 'userId_2';
const userTwoToken = 'userTwo.token';
const userTwoImpersonate = 'userTwo.impersonate.token';

const cookieCreator = (name: string, value: string) => {
  switch (name) {
    case '__Secure-next-auth.session-token':
      return `__Secure-next-auth.session-token=${value}; Secure; ${expireCookieDefaultInfo}`;
    default:
      return `${name}=${value}; ${expireCookieDefaultInfo}`;
  }
};

describe('/api/auth/[...nextauth]', () => {
  it('Standard login', async () => {
    const userInfo = await setUserInfo(userOneToken, userOneId, '');
    expect(userInfo.user?.apiToken).toBe(userOneToken);
    expect(userInfo.user?.userID).toBe(userOneId);
    expect(userInfo.user?.impersonatorApiToken).toBe('');
    expect(userInfo.user?.impersonating).toBe(false);
    expect(userInfo.cookies?.length).toBe(0);
  });

  it('Standard login with impersonatorApiToken', async () => {
    const cookies = `
      ${cookieCreator('mpdx-handoff.impersonate', userOneImpersonate)};
    `;
    const userInfo = await setUserInfo(userOneToken, userOneId, cookies);
    expect(userInfo.user?.apiToken).toBe(userOneImpersonate);
    expect(userInfo.user?.userID).toBe(userOneId);
    expect(userInfo.user?.impersonatorApiToken).toBe(userOneToken);
    expect(userInfo.user?.impersonating).toBe(true);
    expect(userInfo.cookies?.length).toBe(1);
    expect(userInfo?.cookies[0]).toBe(
      `mpdx-handoff.impersonate=; HttpOnly; Secure; path=/; Max-Age=0`,
    );
  });

  it('Log User Two in and ignore standard login details', async () => {
    const cookies = `
      ${cookieCreator('mpdx-handoff.accountConflictUserId', userTwoId)};
      ${cookieCreator('mpdx-handoff.token', userTwoToken)};
    `;
    const userInfo = await setUserInfo(userOneToken, userOneId, cookies);
    expect(userInfo.user?.apiToken).toBe(userTwoToken);
    expect(userInfo.user?.userID).toBe(userTwoId);
    expect(userInfo.user?.impersonatorApiToken).toBe('');
    expect(userInfo.user?.impersonating).toBe(false);
    expect(userInfo.cookies?.length).toBe(2);
    expect(userInfo?.cookies[0]).toBe(
      `mpdx-handoff.accountConflictUserId=; HttpOnly; Secure; path=/; Max-Age=0`,
    );
    expect(userInfo?.cookies[1]).toBe(
      `mpdx-handoff.token=; HttpOnly; Secure; path=/; Max-Age=0`,
    );
  });

  it('Log Impersonate user in, store ImpersonatorToken and ignore standard login details', async () => {
    const cookies = `
      ${cookieCreator('mpdx-handoff.token', userTwoToken)};
      ${cookieCreator('mpdx-handoff.impersonate', userTwoImpersonate)};
    `;

    const userInfo = await setUserInfo(userOneToken, userOneId, cookies);
    expect(userInfo.user?.apiToken).toBe(userTwoImpersonate);
    expect(userInfo.user?.userID).toBe(userOneId);
    expect(userInfo.user?.impersonatorApiToken).toBe(userTwoToken);
    expect(userInfo.user?.impersonating).toBe(true);
    expect(userInfo.cookies?.length).toBe(2);
    expect(userInfo?.cookies[0]).toBe(
      `mpdx-handoff.impersonate=; HttpOnly; Secure; path=/; Max-Age=0`,
    );
    expect(userInfo?.cookies[1]).toBe(
      `mpdx-handoff.token=; HttpOnly; Secure; path=/; Max-Age=0`,
    );
  });

  it('Log Impersonate user in and replace userID', async () => {
    const cookies = `
      ${cookieCreator('mpdx-handoff.accountConflictUserId', userTwoId)};
      ${cookieCreator('mpdx-handoff.token', userTwoToken)};
      ${cookieCreator('mpdx-handoff.impersonate', userTwoImpersonate)};
    `;
    const userInfo = await setUserInfo(userOneToken, userOneId, cookies);
    expect(userInfo.user?.apiToken).toBe(userTwoImpersonate);
    expect(userInfo.user?.userID).toBe(userTwoId);
    expect(userInfo.user?.impersonatorApiToken).toBe(userTwoToken);
    expect(userInfo.user?.impersonating).toBe(true);
    expect(userInfo.cookies?.length).toBe(3);
    expect(userInfo?.cookies[0]).toBe(
      `mpdx-handoff.impersonate=; HttpOnly; Secure; path=/; Max-Age=0`,
    );
    expect(userInfo?.cookies[1]).toBe(
      `mpdx-handoff.accountConflictUserId=; HttpOnly; Secure; path=/; Max-Age=0`,
    );
    expect(userInfo?.cookies[2]).toBe(
      `mpdx-handoff.token=; HttpOnly; Secure; path=/; Max-Age=0`,
    );
  });
});

// MPDX-10086: sessions whose API token predates HCM go-live must sign in once more, so login can
// copy the user's HCM person number from Okta.
describe('session callback', () => {
  // exp is 2026-10-28T14:59:00Z, so minted 2026-09-28T14:59:00Z, before go-live
  const mintedBeforeGoLive =
    'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoidSIsImV4cCI6MTc5MzE5OTU0MH0.sig';
  // exp is 2026-10-28T15:01:00Z, so minted 2026-09-28T15:01:00Z, after go-live
  const mintedAfterGoLive =
    'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoidSIsImV4cCI6MTc5MzE5OTY2MH0.sig';
  // exp is 2026-10-01T18:30:00Z, a 20-minute impersonation token
  const impersonationToken =
    'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoidSIsImV4cCI6MTc5MDg3OTQwMH0.sig';

  const oktaEnv = {
    AUTH_PROVIDER: 'OKTA',
    OKTA_CLIENT_ID: 'client-id',
    OKTA_CLIENT_SECRET: 'client-secret',
    OKTA_ISSUER: 'https://okta.example.com',
  };
  const originalEnv = { ...process.env };
  let sessionCallback: NonNullable<
    NonNullable<NextAuthOptions['callbacks']>['session']
  >;

  beforeAll(() => {
    // Loaded here rather than imported: the module reads these env vars when it loads.
    Object.assign(process.env, oktaEnv);
    const { default: Auth } = jest.requireActual<{
      default: (req: NextApiRequest, res: NextApiResponse) => void;
    }>('pages/api/auth/[...nextauth].page');
    Auth({ headers: {} } as NextApiRequest, {} as NextApiResponse);
    const options: NextAuthOptions = mockNextAuth.mock.calls[0][2];
    sessionCallback = options.callbacks!.session!;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  beforeEach(() => {
    jest.useFakeTimers({ now: new Date('2026-10-01T12:00:00Z') });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const callSession = (token: Partial<JWT>) =>
    sessionCallback({
      session: { expires: '2026-10-31T00:00:00Z' } as Session,
      token: token as JWT,
    } as Parameters<typeof sessionCallback>[0]);

  it('sends a session minted before go-live back to login', () => {
    expect(() => callSession({ apiToken: mintedBeforeGoLive })).toThrow(
      'Expired API token',
    );
  });

  it('keeps a session minted after go-live', () => {
    expect(callSession({ apiToken: mintedAfterGoLive })).toMatchObject({
      user: { apiToken: mintedAfterGoLive },
    });
  });

  it('keeps an impersonation session', () => {
    expect(
      callSession({ apiToken: impersonationToken, impersonating: true }),
    ).toMatchObject({
      user: { apiToken: impersonationToken, impersonating: true },
    });
  });
});
