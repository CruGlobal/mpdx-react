import { ApolloClient } from '@apollo/client';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { signOutAndClear } from 'src/lib/clearSessionData';
import theme from 'src/theme';
import LogoutPage from './logout.page';

jest.mock('src/lib/clearSessionData');

describe('LogoutPage', () => {
  it('clears session data before signing out', async () => {
    render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider>
          <LogoutPage />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    await waitFor(() =>
      expect(signOutAndClear).toHaveBeenCalledWith(expect.any(ApolloClient), {
        callbackUrl: 'signOut',
      }),
    );
  });
});
