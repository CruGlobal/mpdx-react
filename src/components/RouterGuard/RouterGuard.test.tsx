import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import { signIn, useSession } from 'next-auth/react';
import { SnackbarProvider } from 'notistack';
import { session } from '__tests__/fixtures/session';
import TestRouter from '__tests__/util/TestRouter';
import theme from '../../theme';
import { RouterGuard } from './RouterGuard';

interface TestComponentProps {
  pathname: string;
  children: string;
}

const TestComponent: React.FC<TestComponentProps> = ({
  pathname,
  children,
}) => {
  const router = {
    pathname,
    query: { accountListId: 'accountListId' },
    isReady: true,
    push: jest.fn(),
  };

  return (
    <ThemeProvider theme={theme}>
      <TestRouter router={router}>
        <SnackbarProvider>
          <RouterGuard>
            <div>{children}</div>
          </RouterGuard>
        </SnackbarProvider>
      </TestRouter>
    </ThemeProvider>
  );
};

describe('RouterGuard', () => {
  describe('authenticated', () => {
    it('should render when authenticated', async () => {
      const { getByText } = render(
        <TestComponent pathname="/authRoute">Authed route</TestComponent>,
      );

      await waitFor(() =>
        expect(getByText('Authed route')).toBeInTheDocument(),
      );
    });

    it('should render loading indicator while session is loading', async () => {
      (useSession as jest.MockedFn<typeof useSession>).mockReturnValue({
        data: null,
        status: 'loading',
        update: () => Promise.resolve(null),
      });

      const { queryByText, getByTestId } = render(
        <TestComponent pathname="/authRoute">Authed route</TestComponent>,
      );

      await waitFor(() =>
        expect(queryByText('Authed route')).not.toBeInTheDocument(),
      );
      expect(getByTestId('LoadingIndicator')).toBeInTheDocument();
    });

    it('should reauthenticate with token expires', async () => {
      (useSession as jest.MockedFn<typeof useSession>).mockReturnValue({
        data: { ...session, expires: '2019-01-01T00:00:00Z' },
        status: 'authenticated',
        update: () => Promise.resolve(null),
      });

      render(<TestComponent pathname="/authRoute">Authed route</TestComponent>);

      await waitFor(() => expect(signIn).toHaveBeenCalledWith('okta'));
    });

    // Remove alongside the reauth-cutoff effect in RouterGuard after 2026-08-10.
    it('should reauthenticate when the API token predates the reauth cutoff', async () => {
      (useSession as jest.MockedFn<typeof useSession>).mockReturnValue({
        // Future session expiry so the token-expiry effect does not fire; the
        // API token exp is 1000000000 / 2001-09-09, before the 2026-08-10 cutoff.
        data: {
          ...session,
          expires: '2099-01-01T00:00:00Z',
          user: {
            ...session.user,
            apiToken:
              'eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjEwMDAwMDAwMDB9.h2Qk01iTa6nH_U-OpImeSecS7owIx6YMqeh6yfWO7Xg',
          },
        },
        status: 'authenticated',
        update: () => Promise.resolve(null),
      });

      render(<TestComponent pathname="/authRoute">Authed route</TestComponent>);

      await waitFor(() => expect(signIn).toHaveBeenCalledWith('okta'));
    });

    it('should not reauthenticate when the API token is after the cutoff', async () => {
      (useSession as jest.MockedFn<typeof useSession>).mockReturnValue({
        // API token exp is 2000000000 / 2033-05-18, after the 2026-08-10 cutoff.
        data: {
          ...session,
          expires: '2099-01-01T00:00:00Z',
          user: {
            ...session.user,
            apiToken:
              'eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjIwMDAwMDAwMDB9.XIy4tZ8x7c86GgrOHqwZwR_i28BWxknyjPpHpklBw4U',
          },
        },
        status: 'authenticated',
        update: () => Promise.resolve(null),
      });

      const { getByText } = render(
        <TestComponent pathname="/authRoute">Authed route</TestComponent>,
      );

      await waitFor(() =>
        expect(getByText('Authed route')).toBeInTheDocument(),
      );
      expect(signIn).not.toHaveBeenCalled();
    });
  });
});
