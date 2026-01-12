import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { GetAccountListsQuery } from 'pages/GetAccountLists.generated';
import theme from '../../theme';
import AccountLists from '.';

describe('AccountLists', () => {
  it('renders accounts', async () => {
    const { findByRole, getByRole } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<{ GetAccountLists: GetAccountListsQuery }>
          mocks={{
            GetAccountLists: {
              accountLists: {
                nodes: [
                  { name: 'My Personal Staff Account' },
                  { name: 'My Ministry Account' },
                  { name: "My Friend's Staff Account" },
                ],
              },
            },
          }}
        >
          <AccountLists />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    expect(
      await findByRole('heading', { name: 'My Personal Staff Account' }),
    ).toBeInTheDocument();
    expect(
      getByRole('heading', { name: 'My Ministry Account' }),
    ).toBeInTheDocument();
    expect(
      getByRole('heading', { name: "My Friend's Staff Account" }),
    ).toBeInTheDocument();
  });
});
