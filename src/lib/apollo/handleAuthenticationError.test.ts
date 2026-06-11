import { ApolloClient } from '@apollo/client';
import { signOut } from 'next-auth/react';
import { logoutCleanup } from 'src/lib/auth/logoutCleanup';
import { handleAuthenticationError } from './handleAuthenticationError';

jest.mock('src/lib/auth/logoutCleanup', () => ({
  logoutCleanup: jest.fn().mockResolvedValue(undefined),
}));

const mockedLogoutCleanup = jest.mocked(logoutCleanup);
const mockedSignOut = jest.mocked(signOut);

const client = {} as ApolloClient<object>;

const flushMicrotasks = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('handleAuthenticationError', () => {
  beforeEach(() => {
    mockedLogoutCleanup.mockResolvedValue(undefined);
    mockedSignOut.mockResolvedValue(undefined);
  });

  it('runs logoutCleanup to completion before signOut redirects', async () => {
    let resolveCleanup!: () => void;
    mockedLogoutCleanup.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          resolveCleanup = resolve;
        }),
    );

    const handled = handleAuthenticationError(client);
    await flushMicrotasks();

    expect(mockedLogoutCleanup).toHaveBeenCalledWith(client);
    // signOut({ redirect: true }) navigates away — it must not fire until
    // the cleanup chain has fully completed, not merely been invoked
    expect(mockedSignOut).not.toHaveBeenCalled();

    resolveCleanup();
    await handled;

    expect(mockedSignOut).toHaveBeenCalledWith({
      redirect: true,
      callbackUrl: 'signOut',
    });
  });

  it('coalesces concurrent authentication errors into one cleanup and one signOut', async () => {
    let resolveCleanup!: () => void;
    mockedLogoutCleanup.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          resolveCleanup = resolve;
        }),
    );

    const first = handleAuthenticationError(client);
    const second = handleAuthenticationError(client);
    expect(second).toBe(first);

    resolveCleanup();
    await Promise.all([first, second]);

    expect(mockedLogoutCleanup).toHaveBeenCalledTimes(1);
    expect(mockedSignOut).toHaveBeenCalledTimes(1);
  });

  it('still signs out when logoutCleanup rejects', async () => {
    mockedLogoutCleanup.mockRejectedValueOnce(new Error('cleanup failed'));

    await expect(handleAuthenticationError(client)).resolves.toBeUndefined();

    expect(mockedSignOut).toHaveBeenCalledWith({
      redirect: true,
      callbackUrl: 'signOut',
    });
  });

  it('resolves without an unhandled rejection when signOut rejects', async () => {
    mockedSignOut.mockRejectedValueOnce(new Error('network down'));

    await expect(handleAuthenticationError(client)).resolves.toBeUndefined();
  });
});
