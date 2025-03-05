import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, within } from '@testing-library/react';
import { gqlMock } from '__tests__/util/graphqlMocking';
import {
  GetAccountListsDocument,
  GetAccountListsQuery,
} from 'pages/GetAccountLists.generated';
import theme from '../../theme';
import AccountLists from '.';

describe('AccountLists', () => {
  it('has correct defaults', () => {
    const data = gqlMock<GetAccountListsQuery>(GetAccountListsDocument, {
      mocks: {
        accountLists: {
          nodes: [
            { id: '1', name: 'My Personal Staff Account' },
            { id: '2', name: 'My Ministry Account' },
            { id: '3', name: "My Friend's Staff Account" },
          ],
        },
      },
    });

    const { getByTestId } = render(
      <ThemeProvider theme={theme}>
        <AccountLists data={data} />
      </ThemeProvider>,
    );
    expect(
      within(getByTestId('account-list-1')).getByRole('heading', {
        name: 'My Personal Staff Account',
      }),
    ).toBeInTheDocument();
    expect(
      within(getByTestId('account-list-2')).getByRole('heading', {
        name: 'My Ministry Account',
      }),
    ).toBeInTheDocument();
    expect(
      within(getByTestId('account-list-3')).getByRole('heading', {
        name: "My Friend's Staff Account",
      }),
    ).toBeInTheDocument();
  });

  it('ignores machine calculated goal when monthly goal is set', () => {
    const data = gqlMock<GetAccountListsQuery>(GetAccountListsDocument, {
      mocks: {
        accountLists: {
          nodes: [
            {
              name: 'Account',
              monthlyGoal: 1000,
              receivedPledges: 600,
              totalPledges: 800,
              healthIndicatorData: {
                machineCalculatedGoal: 2000,
                machineCalculatedGoalCurrency: 'USD',
              },
              currency: 'USD',
            },
          ],
        },
      },
    });

    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <AccountLists data={data} />
      </ThemeProvider>,
    );
    expect(getByRole('link')).toHaveTextContent(
      'AccountGoal$1,000Gifts Started60%Committed80%',
    );
  });

  it('uses machine calculated goal when goal is not set', () => {
    const data = gqlMock<GetAccountListsQuery>(GetAccountListsDocument, {
      mocks: {
        accountLists: {
          nodes: [
            {
              name: 'Account',
              monthlyGoal: null,
              receivedPledges: 600,
              totalPledges: 800,
              healthIndicatorData: {
                machineCalculatedGoal: 2000,
                machineCalculatedGoalCurrency: 'USD',
              },
              currency: 'USD',
            },
          ],
        },
      },
    });

    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <AccountLists data={data} />
      </ThemeProvider>,
    );
    expect(getByRole('link')).toHaveTextContent(
      'AccountGoal$2,000Gifts Started30%Committed40%',
    );
  });

  it("hides percentages when machine calculated goal currency differs from user's currency", () => {
    const data = gqlMock<GetAccountListsQuery>(GetAccountListsDocument, {
      mocks: {
        accountLists: {
          nodes: [
            {
              name: 'Account',
              monthlyGoal: null,
              receivedPledges: 600,
              totalPledges: 800,
              healthIndicatorData: {
                machineCalculatedGoal: 2000,
                machineCalculatedGoalCurrency: 'EUR',
              },
              currency: 'USD',
            },
          ],
        },
      },
    });

    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <AccountLists data={data} />
      </ThemeProvider>,
    );
    expect(getByRole('link')).toHaveTextContent(
      'AccountGoal€2,000Gifts Started-Committed-',
    );
  });
});
