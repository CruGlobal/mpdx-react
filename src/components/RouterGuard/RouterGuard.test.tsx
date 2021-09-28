import { ThemeProvider } from '@material-ui/styles';
import { render, waitFor } from '@testing-library/react';
import client from 'next-auth/client';
import { SnackbarProvider } from 'notistack';
import * as nextRouter from 'next/router';
import theme from '../../theme';
import { RouterGuard } from './RouterGuard';

jest.mock('next-auth/client');

const session = {
  expires: '2021-10-28T14:48:20.897Z',
  user: {
    email: null,
    image: null,
    name: 'Cool Guy',
    token: 'superLongJwtString',
  },
};

describe('RouterGuard', () => {
  const useRouter = jest.spyOn(nextRouter, 'useRouter');

  describe('authenticated', () => {
    beforeEach(() => {
      (client.getSession as jest.Mock).mockReturnValue(session);
      (useRouter as jest.SpyInstance<
        Pick<nextRouter.NextRouter, 'query' | 'isReady' | 'pathname' | 'push'>
      >).mockImplementation(() => ({
        pathname: '/authRoute',
        query: { accountListId: 'accountListId' },
        isReady: true,
        push: jest.fn(),
      }));
    });

    it('should render when authenticated', async () => {
      const { getByText } = render(
        <ThemeProvider theme={theme}>
          <SnackbarProvider>
            <RouterGuard>
              <div>Authed route</div>
            </RouterGuard>
          </SnackbarProvider>
        </ThemeProvider>,
      );

      await waitFor(() =>
        expect(getByText('Authed route')).toBeInTheDocument(),
      );
    });
  });

  describe('unathenticated', () => {
    beforeEach(() => {
      (client.getSession as jest.Mock).mockReturnValue(null);
      (useRouter as jest.SpyInstance<
        Pick<nextRouter.NextRouter, 'query' | 'isReady' | 'pathname' | 'push'>
      >).mockImplementation(() => ({
        pathname: '/login',
        query: { accountListId: 'accountListId' },
        isReady: true,
        push: jest.fn(),
      }));
    });

    it('should render when unauthenticated and on /login', async () => {
      const { getByText } = render(
        <ThemeProvider theme={theme}>
          <SnackbarProvider>
            <RouterGuard>
              <div>Login page</div>
            </RouterGuard>
          </SnackbarProvider>
        </ThemeProvider>,
      );
      await waitFor(() => expect(getByText('Login page')).toBeInTheDocument());
    });
  });
});
