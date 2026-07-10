import { NextRouter } from 'next/router';
import React, { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import { useAccountListId, useOptionalAccountListId } from './useAccountListId';

const makeWrapper = (router: Partial<NextRouter>) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <TestRouter router={router}>{children}</TestRouter>
  );
  return Wrapper;
};

describe('useOptionalAccountListId', () => {
  it('returns null while the router is not ready', () => {
    const { result } = renderHook(() => useOptionalAccountListId(), {
      wrapper: makeWrapper({ isReady: false, query: {} }),
    });

    expect(result.current).toBeFalsy();
  });

  it('returns null when the route has no accountListId', () => {
    const { result } = renderHook(() => useOptionalAccountListId(), {
      wrapper: makeWrapper({ isReady: true, query: {} }),
    });

    expect(result.current).toBeFalsy();
  });

  it('returns the accountListId from the route', () => {
    const { result } = renderHook(() => useOptionalAccountListId(), {
      wrapper: makeWrapper({
        isReady: true,
        query: { accountListId: 'account-list-1' },
      }),
    });

    expect(result.current).toBe('account-list-1');
  });
});

describe('useAccountListId', () => {
  it('returns the accountListId from the route', () => {
    const { result } = renderHook(() => useAccountListId(), {
      wrapper: makeWrapper({
        isReady: true,
        query: { accountListId: 'account-list-1' },
      }),
    });

    expect(result.current).toBe('account-list-1');
  });

  it('throws when the route has no accountListId', () => {
    expect(() =>
      renderHook(() => useAccountListId(), {
        wrapper: makeWrapper({ isReady: true, query: {} }),
      }),
    ).toThrow(/accountListId/);
  });

  it('throws while the router is not ready', () => {
    expect(() =>
      renderHook(() => useAccountListId(), {
        wrapper: makeWrapper({ isReady: false, query: {} }),
      }),
    ).toThrow(/accountListId/);
  });
});
