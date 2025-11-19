import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { useSnackbar } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { RedirectReason } from 'pages/api/auth/redirectReasonEnum';
import { useRedirectSnackbar } from './useRedirectSnackbar';

jest.mock('notistack');

const mockUseSnackbar = useSnackbar as jest.Mock;

describe('useRedirectSnackbar', () => {
  const enqueueSnackbar = jest.fn();
  const replace = jest.fn();

  const createWrapper = (
    query: Record<string, string>,
    pathname = '/somePath',
  ) => {
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <TestRouter router={{ query, pathname, replace }}>{children}</TestRouter>
    );
    return Wrapper;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSnackbar.mockReturnValue({ enqueueSnackbar });
  });

  it('should show unauthorized snackbar and clean query param', () => {
    renderHook(() => useRedirectSnackbar(), {
      wrapper: createWrapper({ redirect: RedirectReason.Unauthorized }),
    });

    expect(enqueueSnackbar).toHaveBeenCalledWith(
      'You lack the authorization to access that page. If you need to access that page, please reach out to support.',
      {
        variant: 'warning',
        key: `redirect-${RedirectReason.Unauthorized}`,
        preventDuplicate: true,
      },
    );

    expect(replace).toHaveBeenCalledWith(
      { pathname: '/somePath', query: {} },
      undefined,
      { shallow: true },
    );
  });

  it('should show impersonation blocked snackbar and clean query param', () => {
    renderHook(() => useRedirectSnackbar(), {
      wrapper: createWrapper({ redirect: RedirectReason.ImpersonationBlocked }),
    });

    expect(enqueueSnackbar).toHaveBeenCalledWith(
      'Access to that page is blocked while impersonating. If you need to access that page, please reach out to the development team.',
      {
        variant: 'warning',
        key: `redirect-${RedirectReason.ImpersonationBlocked}`,
        preventDuplicate: true,
      },
    );

    expect(replace).toHaveBeenCalledWith(
      { pathname: '/somePath', query: {} },
      undefined,
      { shallow: true },
    );
  });

  it('should not show snackbar when no redirect query param', () => {
    renderHook(() => useRedirectSnackbar(), { wrapper: createWrapper({}) });

    expect(enqueueSnackbar).not.toHaveBeenCalled();
    expect(replace).not.toHaveBeenCalled();
  });

  it('should not show snackbar for unknown redirect reason', () => {
    renderHook(() => useRedirectSnackbar(), {
      wrapper: createWrapper({ redirect: 'unknown_reason' }),
    });

    expect(enqueueSnackbar).not.toHaveBeenCalled();
    expect(replace).not.toHaveBeenCalled();
  });
});
