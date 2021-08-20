import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@material-ui/core';
import { DesignationAccountsQuery } from './GetDesignationAccounts.generated';
import { DesignationAccountsReport } from './DesignationAccountsReport';
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
  DesignationAccounts: {
    designationAccounts: [
      {
        organizationName: 'test org 01',
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

const errorMocks = {
  DesignationAccounts: {},
  error: { name: 'error', message: 'Error loading data.  Try again.' },
};

const emptyMocks = {
  DesignationAccounts: {
    designationAccounts: [],
  },
};

describe('DesignationAccountsReport', () => {
  it('default', async () => {
    const { getByText, getByTestId, queryByTestId } = render(
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
    expect(getByText('CA$3,500')).toBeInTheDocument();
    expect(queryByTestId('Notification')).not.toBeInTheDocument();
    expect(getByTestId('AccountsGroupList')).toBeInTheDocument();
    expect(getByTestId('DesignationAccountsScrollBox')).toBeInTheDocument();
  });

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

  it('error', async () => {
    const { queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<DesignationAccountsQuery> mocks={errorMocks}>
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

    expect(queryByTestId('Notification')).toBeInTheDocument();
  });

  it('empty', async () => {
    const { queryByTestId, getByText } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<DesignationAccountsQuery> mocks={emptyMocks}>
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
