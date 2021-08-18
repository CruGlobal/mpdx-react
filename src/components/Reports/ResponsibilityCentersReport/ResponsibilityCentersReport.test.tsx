import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@material-ui/core';
import { FinancialAccountsQuery } from './GetFinancialAccounts.generated';
import { ResponsibilityCentersReport } from './ResponsibilityCentersReport';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';

jest.mock('next/router', () => ({
  useRouter: () => {
    return {
      query: { accountListId: 'abc' },
      isReady: true,
    };
  },
}));

const accountListId = '111';
const title = 'test title';
const onNavListToggle = jest.fn();

const mocks = {
  FinancialAccounts: {
    financialAccounts: {
      edges: [
        {
          node: {
            active: false,
            balance: {
              conversionDate: '2/2/2021',
              convertedAmount: 3500,
              convertedCurrency: 'CAD',
            },
            code: '13212',
            id: 'test-id-111',
            name: 'Test Account',
            organization: {
              id: '111-2222-3333',
              name: 'test org 01',
            },
            updatedAt: '2/2/2021',
          },
        },
      ],
    },
  },
};

const errorMocks = {
  FinancialAccounts: {},
  error: { name: 'error', message: 'Error loading data.  Try again.' },
};

const emptyMocks = {
  FinancialAccounts: {
    financialAccounts: {
      edges: [],
    },
  },
};

describe('ResponsibilityCentersReport', () => {
  it('default', async () => {
    const { getByText, getByTestId, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<FinancialAccountsQuery> mocks={mocks}>
          <ResponsibilityCentersReport
            accountListId={accountListId}
            isNavListOpen={true}
            title={title}
            onNavListToggle={onNavListToggle}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(
        queryByTestId('LoadingResponsibilityCenters'),
      ).not.toBeInTheDocument();
    });

    expect(getByText(title)).toBeInTheDocument();
    expect(getByText('CA$3,500')).toBeInTheDocument();
    expect(queryByTestId('Notification')).not.toBeInTheDocument();
    expect(getByTestId('AccountsGroupList')).toBeInTheDocument();
    expect(getByTestId('ResponsibilityCentersScrollBox')).toBeInTheDocument();
  });

  it('loading', async () => {
    const { queryByTestId, getByText } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<FinancialAccountsQuery>>
          <ResponsibilityCentersReport
            accountListId={accountListId}
            isNavListOpen={true}
            title={title}
            onNavListToggle={onNavListToggle}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    expect(getByText(title)).toBeInTheDocument();
    expect(queryByTestId('LoadingResponsibilityCenters')).toBeInTheDocument();
    expect(queryByTestId('Notification')).not.toBeInTheDocument();
  });

  it('error', async () => {
    const { queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<FinancialAccountsQuery> mocks={errorMocks}>
          <ResponsibilityCentersReport
            accountListId={accountListId}
            isNavListOpen={true}
            title={title}
            onNavListToggle={onNavListToggle}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(
        queryByTestId('LoadingResponsibilityCenters'),
      ).not.toBeInTheDocument();
    });

    expect(queryByTestId('Notification')).toBeInTheDocument();
  });

  it('empty', async () => {
    const { queryByTestId, getByText } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<FinancialAccountsQuery> mocks={emptyMocks}>
          <ResponsibilityCentersReport
            accountListId={accountListId}
            isNavListOpen={true}
            title={title}
            onNavListToggle={onNavListToggle}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(
        queryByTestId('LoadingResponsibilityCenters'),
      ).not.toBeInTheDocument();
    });

    expect(getByText(title)).toBeInTheDocument();
    expect(queryByTestId('EmptyReport')).toBeInTheDocument();
  });
});
