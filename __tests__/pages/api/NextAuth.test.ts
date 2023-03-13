import { setUserInfo } from 'pages/api/auth/setUserInfo';
import {
  nextAuthSessionCookieName,
  expireCookieDefaultInfo,
} from 'pages/api/utils/cookies';

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
    case nextAuthSessionCookieName:
      return `${nextAuthSessionCookieName}=${value}; Secure; HttpOnly; path=/; Max-Age=0`;
    case 'mpdx-handoff.logged-in':
      return `mpdx-handoff.logged-in=${value}; path=/; domain=${process.env.REWRITE_DOMAIN}`;
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
      `mpdx-handoff.impersonate=; HttpOnly; path=/; Max-Age=0`,
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
      `mpdx-handoff.accountConflictUserId=; HttpOnly; path=/; Max-Age=0`,
    );
    expect(userInfo?.cookies[1]).toBe(
      `mpdx-handoff.token=; HttpOnly; path=/; Max-Age=0`,
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
      `mpdx-handoff.impersonate=; HttpOnly; path=/; Max-Age=0`,
    );
    expect(userInfo?.cookies[1]).toBe(
      `mpdx-handoff.token=; HttpOnly; path=/; Max-Age=0`,
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
      `mpdx-handoff.impersonate=; HttpOnly; path=/; Max-Age=0`,
    );
    expect(userInfo?.cookies[1]).toBe(
      `mpdx-handoff.accountConflictUserId=; HttpOnly; path=/; Max-Age=0`,
    );
    expect(userInfo?.cookies[2]).toBe(
      `mpdx-handoff.token=; HttpOnly; path=/; Max-Age=0`,
    );
  });
});
