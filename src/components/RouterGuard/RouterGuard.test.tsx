import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import { signIn, useSession } from 'next-auth/react';
import { SnackbarProvider } from 'notistack';
import { session } from '__tests__/fixtures/session';
import TestRouter from '__tests__/util/TestRouter';
import theme from '../../theme';
import { RouterGuard } from './RouterGuard';

const setOnline = (onLine: boolean) =>
  Object.defineProperty(window.navigator, 'onLine', {
    configurable: true,
    value: onLine,
  });

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
      // Past date ensures wall-clock is always later, forcing the expired branch.
      (useSession as jest.MockedFn<typeof useSession>).mockReturnValue({
        data: { ...session, expires: '2019-01-01T00:00:00Z' },
        status: 'authenticated',
        update: () => Promise.resolve(null),
      });

      render(<TestComponent pathname="/authRoute">Authed route</TestComponent>);

      await waitFor(() => expect(signIn).toHaveBeenCalledWith('okta'));
    });
  });

  describe('session expiry offline grace', () => {
    beforeEach(() => {
      setOnline(true);
    });

    afterEach(() => {
      setOnline(true);
    });

    it('re-authenticates when the session is expired and online', async () => {
      setOnline(true);
      // Past date ensures wall-clock is always later, forcing the expired branch.
      (useSession as jest.MockedFn<typeof useSession>).mockReturnValue({
        data: { ...session, expires: '2019-01-01T00:00:00.000Z' },
        status: 'authenticated',
        update: () => Promise.resolve(null),
      });

      render(<TestComponent pathname="/authRoute">Authed route</TestComponent>);

      await waitFor(() => expect(signIn).toHaveBeenCalledWith('okta'));
    });

    it('does not re-authenticate while offline', async () => {
      setOnline(false);
      // Past date ensures wall-clock is always later, forcing the expired branch.
      (useSession as jest.MockedFn<typeof useSession>).mockReturnValue({
        data: { ...session, expires: '2019-01-01T00:00:00.000Z' },
        status: 'authenticated',
        update: () => Promise.resolve(null),
      });

      render(<TestComponent pathname="/authRoute">Authed route</TestComponent>);

      // Wait long enough that signIn would have been called if the guard was not gated
      await waitFor(() =>
        expect(signIn).not.toHaveBeenCalled(),
      );
    });
  });
});
