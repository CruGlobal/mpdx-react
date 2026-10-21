import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import { signIn, useSession } from 'next-auth/react';
import { SnackbarProvider } from 'notistack';
import { session } from '__tests__/fixtures/session';
import TestRouter from '__tests__/util/TestRouter';
import theme from '../../theme';
import { RouterGuard } from './RouterGuard';

const push = jest.fn();

interface TestComponentProps {
  pathname: string;
  isReady?: boolean;
  children: string;
}

const TestComponent: React.FC<TestComponentProps> = ({
  pathname,
  isReady = true,
  children,
}) => {
  const router = {
    pathname,
    query: isReady ? { accountListId: 'accountListId' } : {},
    isReady,
    push,
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
      const { findByText } = render(
        <TestComponent pathname="/authRoute">Authed route</TestComponent>,
      );

      expect(await findByText('Authed route')).toBeInTheDocument();
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

    it('should render loading indicator until the router is ready', () => {
      (useSession as jest.MockedFn<typeof useSession>).mockReturnValue({
        data: session,
        status: 'authenticated',
        update: () => Promise.resolve(null),
      });

      const { queryByText, getByTestId, rerender } = render(
        <TestComponent pathname="/authRoute" isReady={false}>
          Authed route
        </TestComponent>,
      );

      expect(queryByText('Authed route')).not.toBeInTheDocument();
      expect(getByTestId('LoadingIndicator')).toBeInTheDocument();

      rerender(
        <TestComponent pathname="/authRoute">Authed route</TestComponent>,
      );

      expect(queryByText('Authed route')).toBeInTheDocument();
    });

    it('should redirect to the login page when unauthenticated', () => {
      (useSession as jest.MockedFn<typeof useSession>).mockImplementation(
        (options) => {
          options?.onUnauthenticated?.();
          return {
            data: null,
            status: 'loading',
            update: () => Promise.resolve(null),
          };
        },
      );

      render(<TestComponent pathname="/authRoute">Authed route</TestComponent>);

      expect(push).toHaveBeenCalledWith({
        pathname: '/login',
        query: { redirect: window.location.href },
      });
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
  });
});
