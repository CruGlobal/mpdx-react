import React, { useState } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { CreateAssistantTokenMutation } from './CreateAssistantToken.generated';
import { RefusedMintProvider, mintedToken } from './assistantToken.mock';
import { useAssistantToken } from './useAssistantToken';

const minutes = (count: number) => count * 60 * 1000;

const renderToken = (
  mint: () => CreateAssistantTokenMutation = () => mintedToken('minted-token'),
  accountListId: string | null = 'account-list-1',
) => {
  const mutationSpy = jest.fn();
  const Wrapper: React.FC<{ children: React.ReactElement }> = ({
    children,
  }) => (
    <GqlMockedProvider
      mocks={{ CreateAssistantToken: mint }}
      onCall={mutationSpy}
    >
      {children}
    </GqlMockedProvider>
  );
  // Holds the account list in state so switching it does not rerender the mocked provider
  const utils = renderHook(
    () => {
      const [currentAccountListId, setAccountListId] = useState(accountListId);
      return { ...useAssistantToken(currentAccountListId), setAccountListId };
    },
    { wrapper: Wrapper },
  );
  const mintCount = () =>
    mutationSpy.mock.calls.filter(
      ([{ operation }]) => operation.operationName === 'CreateAssistantToken',
    ).length;
  return { ...utils, mutationSpy, mintCount };
};

const renderRefused = (message: string, onMint?: () => void) =>
  renderHook(() => useAssistantToken('account-list-1'), {
    wrapper: ({ children }) => (
      <RefusedMintProvider message={message} onMint={onMint}>
        {children}
      </RefusedMintProvider>
    ),
  });

describe('useAssistantToken', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('mints a token for the account list on mount', async () => {
    const { result, mutationSpy } = renderToken();

    expect(result.current.status).toBe('loading');
    await waitFor(() => expect(result.current.status).toBe('ready'));

    expect(result.current.token).toBe('minted-token');
    expect(mutationSpy).toHaveGraphqlOperation('CreateAssistantToken', {
      accountListId: 'account-list-1',
    });
  });

  it('refreshes about a minute before the token expires', async () => {
    jest.useFakeTimers();
    let count = 0;
    const { result, mintCount } = renderToken(() =>
      mintedToken(`minted-token-${++count}`),
    );
    await waitFor(() => expect(result.current.token).toBe('minted-token-1'));

    act(() => jest.advanceTimersByTime(minutes(13)));
    expect(mintCount()).toBe(1);

    act(() => jest.advanceTimersByTime(minutes(1) + 1000));
    await waitFor(() => expect(result.current.token).toBe('minted-token-2'));
    expect(mintCount()).toBe(2);
  });

  it('stops refreshing after unmount', async () => {
    jest.useFakeTimers();
    const { result, unmount, mintCount } = renderToken();
    await waitFor(() => expect(result.current.status).toBe('ready'));

    unmount();
    act(() => jest.advanceTimersByTime(minutes(30)));

    expect(mintCount()).toBe(1);
  });

  it('shares one mint between concurrent refreshes', async () => {
    const { result, mintCount } = renderToken();
    await waitFor(() => expect(result.current.status).toBe('ready'));

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
    let count = 0;
    const { result, mutationSpy, mintCount } = renderToken(() =>
      mintedToken(`minted-token-${++count}`),
    );
    await waitFor(() => expect(result.current.token).toBe('minted-token-1'));

    act(() => result.current.setAccountListId('account-list-2'));

    expect(result.current).toMatchObject({ token: null, status: 'loading' });
    await waitFor(() => expect(result.current.token).toBe('minted-token-2'));
    expect(mintCount()).toBe(2);
    expect(mutationSpy).toHaveGraphqlOperation('CreateAssistantToken', {
      accountListId: 'account-list-2',
    });
  });

  it('does not mint without an account list', () => {
    const { result, mintCount } = renderToken(undefined, null);

    expect(result.current).toMatchObject({ token: null, status: 'idle' });
    expect(mintCount()).toBe(0);
  });

  it.each([
    'The assistant is not turned on',
    'No assistant features are turned on',
  ])('reports not turned on when the mint says %p', async (message) => {
    const { result } = renderRefused(message);

    await waitFor(() => expect(result.current.status).toBe('notTurnedOn'));
    expect(result.current.token).toBeNull();
  });

  it('reports an error when the mint is refused under impersonation', async () => {
    const { result } = renderRefused('Not available while impersonating');

    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.token).toBeNull();
  });

  it('does not mint again after a refusal', async () => {
    const onMint = jest.fn();
    const { result } = renderRefused('The assistant is not turned on', onMint);
    await waitFor(() => expect(result.current.status).toBe('notTurnedOn'));

    let refreshed: string | null = 'unset';
    await act(async () => {
      refreshed = await result.current.refreshToken();
    });

    expect(refreshed).toBeNull();
    expect(onMint).toHaveBeenCalledTimes(1);
  });
});
