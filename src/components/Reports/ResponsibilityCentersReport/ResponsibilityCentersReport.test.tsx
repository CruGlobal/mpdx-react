import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import {
  FinancialAccountsDocument,
  FinancialAccountsQuery,
} from './GetFinancialAccounts.generated';
import { ResponsibilityCentersReport } from './ResponsibilityCentersReport';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';

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
      nodes: [
        {
          active: true,
          balance: {
            conversionDate: '2021-02-02',
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
          updatedAt: '2021-02-02',
        },
      ],
    },
  },
};

const errorMock: MockedResponse = {
  request: {
    query: FinancialAccountsDocument,
  },
  error: { name: 'error', message: 'Error loading data.  Try again.' },
};

const emptyMocks = {
  FinancialAccounts: {
    financialAccounts: {
      nodes: [],
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
    expect(getByText('-CA$3,500')).toBeInTheDocument();
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
        <MockedProvider mocks={[errorMock]}>
          <ResponsibilityCentersReport
            accountListId={accountListId}
            isNavListOpen={true}
            title={title}
            onNavListToggle={onNavListToggle}
          />
        </MockedProvider>
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

  it('filters report by designation account', async () => {
    const mutationSpy = jest.fn();
    render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<FinancialAccountsQuery>
          mocks={mocks}
          onCall={mutationSpy}
        >
          <ResponsibilityCentersReport
            accountListId={accountListId}
            designationAccounts={['account-1']}
            isNavListOpen={true}
            title={title}
            onNavListToggle={onNavListToggle}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    await waitFor(() =>
      expect(mutationSpy.mock.calls[0][0]).toMatchObject({
        operation: {
          operationName: 'FinancialAccounts',
          variables: {
            designationAccountIds: ['account-1'],
          },
        },
      }),
    );
  });

  it('does not filter report by designation account', async () => {
    const mutationSpy = jest.fn();
    render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<FinancialAccountsQuery>
          mocks={mocks}
          onCall={mutationSpy}
        >
          <ResponsibilityCentersReport
            accountListId={accountListId}
            isNavListOpen={true}
            title={title}
            onNavListToggle={onNavListToggle}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    await waitFor(() =>
      expect(mutationSpy.mock.calls[0][0]).toMatchObject({
        operation: {
          operationName: 'FinancialAccounts',
          variables: {
            designationAccountIds: null,
          },
        },
      }),
    );
  });
});
