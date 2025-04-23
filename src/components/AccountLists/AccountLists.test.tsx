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

  it('ignores machine-calculated goal when monthly goal is set', () => {
    const data = gqlMock<GetAccountListsQuery>(GetAccountListsDocument, {
      mocks: {
        accountLists: {
          nodes: [
            {
              name: 'Account',
              monthlyGoal: 1000,
              monthlyGoalUpdatedAt: '2024-01-01T00:00:00Z',
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
      'AccountGoal$1,000*Gifts Started60%Committed80%*Below NetSuite-calculated goal',
    );
  });

  it('uses machine-calculated goal when goal is not set', () => {
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
      'AccountGoal$2,000*Gifts Started30%Committed40%*NetSuite-calculated',
    );
  });

  it('adds color and label to machine-calculated goals', () => {
    const data = gqlMock<GetAccountListsQuery>(GetAccountListsDocument, {
      mocks: {
        accountLists: {
          nodes: [
            {
              name: 'Account',
              monthlyGoal: null,
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

    const { getByLabelText, getByText } = render(
      <ThemeProvider theme={theme}>
        <AccountLists data={data} />
      </ThemeProvider>,
    );
    expect(
      getByLabelText(/^Your current goal of \$2,000 is NetSuite-calculated/),
    ).toBeInTheDocument();
    expect(getByText('NetSuite-calculated')).toHaveStyle(
      'color: rgb(211, 68, 0);',
    );
  });

  it("hides percentages when machine-calculated goal currency differs from user's currency", () => {
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
      'AccountGifts Started-Committed-',
    );
  });

  describe('updated date', () => {
    it('is the date the goal was last updated', () => {
      const data = gqlMock<GetAccountListsQuery>(GetAccountListsDocument, {
        mocks: {
          accountLists: {
            nodes: [{ monthlyGoalUpdatedAt: '2019-12-30T00:00:00Z' }],
          },
        },
      });

      const { getByText } = render(
        <ThemeProvider theme={theme}>
          <AccountLists data={data} />
        </ThemeProvider>,
      );
      expect(getByText('Last updated Dec 30, 2019')).toBeInTheDocument();
    });

    it('is hidden if the goal is missing', () => {
      const data = gqlMock<GetAccountListsQuery>(GetAccountListsDocument, {
        mocks: {
          accountLists: {
            nodes: [
              {
                monthlyGoal: null,
                monthlyGoalUpdatedAt: '2019-12-30T00:00:00Z',
              },
            ],
          },
        },
      });

      const { queryByText } = render(
        <ThemeProvider theme={theme}>
          <AccountLists data={data} />
        </ThemeProvider>,
      );
      expect(queryByText('Last updated Dec 30, 2019')).not.toBeInTheDocument();
    });
  });

  describe('below machine-calculated warning', () => {
    it('is shown if goal is less than the machine-calculated goal', () => {
      const data = gqlMock<GetAccountListsQuery>(GetAccountListsDocument, {
        mocks: {
          accountLists: {
            nodes: [
              {
                currency: 'USD',
                monthlyGoal: 5000,
                healthIndicatorData: {
                  machineCalculatedGoal: 10000,
                  machineCalculatedGoalCurrency: 'USD',
                },
              },
            ],
          },
        },
      });

      const { getByText } = render(
        <ThemeProvider theme={theme}>
          <AccountLists data={data} />
        </ThemeProvider>,
      );
      expect(getByText('Below NetSuite-calculated goal')).toBeInTheDocument();
    });

    it('is hidden if goal is greater than or equal to the machine-calculated goal', async () => {
      const data = gqlMock<GetAccountListsQuery>(GetAccountListsDocument, {
        mocks: {
          accountLists: {
            nodes: [
              {
                currency: 'USD',
                monthlyGoal: 5000,
                healthIndicatorData: {
                  machineCalculatedGoal: 5000,
                  machineCalculatedGoalCurrency: 'USD',
                },
              },
            ],
          },
        },
      });

      const { queryByText } = render(
        <ThemeProvider theme={theme}>
          <AccountLists data={data} />
        </ThemeProvider>,
      );
      expect(
        queryByText('Below NetSuite-calculated goal'),
      ).not.toBeInTheDocument();
    });
  });
});
