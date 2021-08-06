import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@material-ui/core';
import { DesignationAccountsQuery } from './GetDesignationAccounts.generated';
import { DesignationAccountsReport } from './DesignationAccountsReport';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';

const accountListId = '111';
const title = 'test title';
const onNavListToggle = jest.fn();

describe('DesignationAccounts', () => {
  it('loading', async () => {
    const { queryByTestId, getByText } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<DesignationAccountsQuery>>
          <DesignationAccountsReport
            accountListId={accountListId}
            isNavListOpen={true}
            title={title}
            onNavListToggle={onNavListToggle}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    expect(getByText(title)).toBeInTheDocument();
    expect(queryByTestId('LoadingDesignationAccounts')).toBeInTheDocument();
    expect(queryByTestId('Notification')).not.toBeInTheDocument();
  });

  it('designation accounts loaded', async () => {
    const mocks = {
      DesignationAccountsReport: {
        designationAccounts: [
          {
            organizationName: 'test org 01',
            balance: 3255,
            designationAccounts: [
              {
                active: false,
                id: 'test-id-111',
                balanceUpdatedAt: '2/2/2021',
                convertedBalance: 3500,
                currency: 'CAD',
                designationNumber: '33221',
                name: 'Test Account',
              },
            ],
          },
        ],
      },
    };

    const { queryByTestId, getByTestId, getByText } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<DesignationAccountsQuery> mocks={mocks}>
          <DesignationAccountsReport
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
        queryByTestId('LoadingDesignationAccounts'),
      ).not.toBeInTheDocument();
    });

    expect(getByText(title)).toBeInTheDocument();
    expect(getByTestId('DesignationAccountsGroupList')).toBeInTheDocument();
    expect(getByTestId('DesignationAccountsScrollBox')).toBeInTheDocument();
  });

  it('empty', async () => {
    const mocks = {
      DesignationAccountsReport: {
        designationAccounts: [],
      },
    };

    const { queryByTestId, getByText } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<DesignationAccountsQuery> mocks={mocks}>
          <DesignationAccountsReport
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
        queryByTestId('LoadingDesignationAccounts'),
      ).not.toBeInTheDocument();
    });

    expect(getByText(title)).toBeInTheDocument();
    expect(queryByTestId('EmptyReport')).toBeInTheDocument();
  });
});
