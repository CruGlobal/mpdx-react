import React, { useState } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { MintOutcome, MintSequenceProvider } from './assistantToken.mock';
import { useAssistantToken } from './useAssistantToken';

const seconds = (count: number) => count * 1000;
const minutes = (count: number) => count * 60 * 1000;

const renderToken = (
  outcomes: MintOutcome[] = [{ token: 'minted-token' }],
  accountListId: string | null = 'account-list-1',
) => {
  const onMint = jest.fn();
  const Wrapper: React.FC<{ children: React.ReactElement }> = ({
    children,
  }) => (
    <MintSequenceProvider outcomes={outcomes} onMint={onMint}>
      {children}
    </MintSequenceProvider>
  );
  // Holds the account list in state so switching it does not rerender the mocked provider
  const utils = renderHook(
    () => {
      const [currentAccountListId, setAccountListId] = useState(accountListId);
      return { ...useAssistantToken(currentAccountListId), setAccountListId };
    },
    { wrapper: Wrapper },
  );
  const mintCount = () => onMint.mock.calls.length;
  // Fires the timers, then waits for the mint they started, which refreshToken shares while it is in flight
  const fireMint = async (ms: number) => {
    act(() => jest.advanceTimersByTime(ms));
    await act(async () => {
      await utils.result.current.refreshToken();
    });
  };
  return { ...utils, onMint, mintCount, fireMint };
};

describe('useAssistantToken', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('mints a token for the account list on mount', async () => {
    const { result, onMint } = renderToken();

    expect(result.current.state).toEqual({ status: 'minting' });
    await waitFor(() => expect(result.current.state.status).toBe('ready'));

    expect(result.current.token).toBe('minted-token');
    expect(result.current.state).toMatchObject({
      token: 'minted-token',
      expiresAt: expect.any(Number),
    });
    expect(onMint).toHaveBeenCalledWith({ accountListId: 'account-list-1' });
  });

  it('refreshes about a minute before the token expires', async () => {
    jest.useFakeTimers();
    const { result, mintCount } = renderToken([
      { token: 'minted-token-1' },
      { token: 'minted-token-2' },
    ]);
    await waitFor(() => expect(result.current.token).toBe('minted-token-1'));

    act(() => jest.advanceTimersByTime(minutes(13)));
    expect(mintCount()).toBe(1);

    act(() => jest.advanceTimersByTime(minutes(1) + 1000));
    await waitFor(() => expect(result.current.token).toBe('minted-token-2'));
    expect(mintCount()).toBe(2);
  });

  it('keeps the token and backs off when a background refresh fails', async () => {
    jest.useFakeTimers();
    const { result, mintCount, fireMint } = renderToken([
      { token: 'minted-token-1' },
      { networkError: true },
      { networkError: true },
      { networkError: true },
      { token: 'minted-token-2' },
    ]);
    await waitFor(() => expect(result.current.token).toBe('minted-token-1'));

    await fireMint(minutes(14));
    expect(mintCount()).toBe(2);
    expect(result.current.state).toMatchObject({
      status: 'ready',
      token: 'minted-token-1',
    });

    await fireMint(seconds(5));
    expect(mintCount()).toBe(3);
    act(() => jest.advanceTimersByTime(seconds(14)));
    expect(mintCount()).toBe(3);
    await fireMint(seconds(1));
    expect(mintCount()).toBe(4);
    expect(result.current.token).toBe('minted-token-1');

    // The next 60 second retry would land after the token expires, so it runs at the expiry instead
    await fireMint(seconds(40));
    expect(mintCount()).toBe(5);
    expect(result.current.token).toBe('minted-token-2');
  });

  it('fails once the token expires while refreshes keep failing', async () => {
    jest.useFakeTimers();
    const { result, mintCount, fireMint } = renderToken([
      { token: 'minted-token', expiresInMs: minutes(2) },
      { networkError: true },
    ]);
    await waitFor(() => expect(result.current.token).toBe('minted-token'));

    await fireMint(seconds(60));
    await fireMint(seconds(5));
    await fireMint(seconds(15));
    act(() => jest.advanceTimersByTime(seconds(39)));
    expect(mintCount()).toBe(4);
    expect(result.current.state.status).toBe('ready');

    await fireMint(seconds(1));
    expect(mintCount()).toBe(5);
    expect(result.current.state).toEqual({ status: 'failed', retryable: true });
    expect(result.current.token).toBeNull();

    act(() => jest.advanceTimersByTime(minutes(30)));
    expect(mintCount()).toBe(5);
  });

  it('refreshes at the 30 second floor when the expiry is malformed', async () => {
    jest.useFakeTimers();
    const { result, mintCount, fireMint } = renderToken([
      { token: 'minted-token-1', expiresAt: 'not a date' },
      { token: 'minted-token-2' },
    ]);
    await waitFor(() => expect(result.current.token).toBe('minted-token-1'));

    act(() => jest.advanceTimersByTime(seconds(29)));
    expect(mintCount()).toBe(1);

    await fireMint(seconds(1));
    expect(mintCount()).toBe(2);
    expect(result.current.token).toBe('minted-token-2');
  });

  it('stops refreshing after unmount', async () => {
    jest.useFakeTimers();
    const { result, unmount, mintCount } = renderToken();
    await waitFor(() => expect(result.current.state.status).toBe('ready'));

    unmount();
    act(() => jest.advanceTimersByTime(minutes(30)));

    expect(mintCount()).toBe(1);
  });

  it('shares one mint between concurrent refreshes', async () => {
    const { result, mintCount } = renderToken();
    await waitFor(() => expect(result.current.state.status).toBe('ready'));

    let tokens: Array<string | null> = [];
    await act(async () => {
      tokens = await Promise.all([
        result.current.refreshToken(),
        result.current.refreshToken(),
      ]);
    });

    expect(tokens).toEqual(['minted-token', 'minted-token']);
    expect(mintCount()).toBe(2);
  });

  it('mints a new token when the account list changes', async () => {
    const { result, onMint, mintCount } = renderToken([
      { token: 'minted-token-1' },
      { token: 'minted-token-2' },
    ]);
    await waitFor(() => expect(result.current.token).toBe('minted-token-1'));

    act(() => result.current.setAccountListId('account-list-2'));

    expect(result.current).toMatchObject({
      token: null,
      state: { status: 'minting' },
    });
    await waitFor(() => expect(result.current.token).toBe('minted-token-2'));
    expect(mintCount()).toBe(2);
    expect(onMint).toHaveBeenLastCalledWith({
      accountListId: 'account-list-2',
    });
  });

  it('does not mint without an account list', () => {
    const { result, mintCount } = renderToken(undefined, null);

    expect(result.current).toMatchObject({
      token: null,
      state: { status: 'idle' },
    });
    expect(mintCount()).toBe(0);
  });

  it('stays idle without an Apollo client', () => {
    const { result } = renderHook(() => useAssistantToken('account-list-1'));

    expect(result.current).toMatchObject({
      token: null,
      state: { status: 'idle' },
    });
  });

  it.each([
    'The assistant is not turned on',
    'No assistant features are turned on',
  ])('reports not turned on when the mint says %p', async (message) => {
    const { result } = renderToken([{ refusal: message }]);

    await waitFor(() =>
      expect(result.current.state).toEqual({
        status: 'refusing',
        reason: 'notTurnedOn',
      }),
    );
    expect(result.current.token).toBeNull();
  });

  it('reports a refusal when the mint is refused under impersonation', async () => {
    const { result } = renderToken([
      { refusal: 'Not available while impersonating' },
    ]);

    await waitFor(() =>
      expect(result.current.state).toEqual({
        status: 'refusing',
        reason: 'notAllowed',
      }),
    );
    expect(result.current.token).toBeNull();
  });

  it('does not mint again after a refusal', async () => {
    const { result, mintCount } = renderToken([
      { refusal: 'The assistant is not turned on' },
    ]);
    await waitFor(() => expect(result.current.state.status).toBe('refusing'));

    let refreshed: string | null = 'unset';
    await act(async () => {
      refreshed = await result.current.refreshToken();
    });
    act(() => result.current.retry());

    expect(refreshed).toBeNull();
    expect(mintCount()).toBe(1);
  });

  it('fails a first mint that does not reach the server and mints again on retry', async () => {
    const { result, mintCount } = renderToken([
      { networkError: true },
      { token: 'minted-token' },
    ]);
    await waitFor(() =>
      expect(result.current.state).toEqual({
        status: 'failed',
        retryable: true,
      }),
    );

    act(() => result.current.retry());

    expect(result.current.state).toEqual({ status: 'minting' });
    await waitFor(() => expect(result.current.token).toBe('minted-token'));
    expect(mintCount()).toBe(2);
  });
});
