import React from 'react';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { ThemeProvider } from '@mui/material/styles';
import { act, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import {
  GetUserDocument,
  GetUserQuery,
} from 'src/components/User/GetUser.generated';
import { UsStaffGroupEnum } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { DesignationAccountsReport } from './DesignationAccountsReport';
import {
  DesignationAccountsDocument,
  DesignationAccountsQuery,
} from './GetDesignationAccounts.generated';

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
  GetUser: {
    user: {
      usStaffGroup: UsStaffGroupEnum.SeniorStaff,
      spouseUsStaffGroup: null,
    },
  },
  DesignationAccounts: {
    designationAccounts: [
      {
        organizationName: 'test org 01',
        designationAccounts: [
          {
            active: true,
            id: 'test-id-111',
            balanceUpdatedAt: '2021-02-02',
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

const errorMock: MockedResponse = {
  request: {
    query: DesignationAccountsDocument,
  },
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
        <GqlMockedProvider<{
          GetUser: GetUserQuery;
          DesignationAccounts: DesignationAccountsQuery;
        }>
          mocks={mocks}
        >
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

  it('hides balances from paid with designation staff', async () => {
    const { findByText, queryByText } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<{
          GetUser: GetUserQuery;
          DesignationAccounts: DesignationAccountsQuery;
        }>
          mocks={{
            ...mocks,
            GetUser: {
              user: {
                usStaffGroup: UsStaffGroupEnum.PaidWithDesignation,
                spouseUsStaffGroup: null,
              },
            },
          }}
        >
          <DesignationAccountsReport
            accountListId={accountListId}
            isNavListOpen={true}
            title={title}
            onNavListToggle={onNavListToggle}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    expect(await findByText('Test Account')).toBeInTheDocument();
    expect(queryByText(/3,500/)).not.toBeInTheDocument();
  });

  it('shows no total before the user loads', async () => {
    const { queryByText } = render(
      <ThemeProvider theme={theme}>
        <MockedProvider
          addTypename={false}
          mocks={[
            {
              request: {
                query: DesignationAccountsDocument,
                variables: { accountListId },
              },
              result: { data: mocks.DesignationAccounts },
            },
            {
              request: { query: GetUserDocument },
              delay: 60_000,
              result: { data: mocks.GetUser },
            },
          ]}
        >
          <DesignationAccountsReport
            accountListId={accountListId}
            isNavListOpen={true}
            title={title}
            onNavListToggle={onNavListToggle}
          />
        </MockedProvider>
      </ThemeProvider>,
    );

    // Let the designation accounts arrive while GetUser is still pending
    await act(() => new Promise((resolve) => setTimeout(resolve, 100)));
    expect(queryByText(/Balance:/)).not.toBeInTheDocument();
  });

  it('loading', async () => {
    const { queryByTestId, getByText } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider>
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
        <MockedProvider mocks={[errorMock]}>
          <DesignationAccountsReport
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
        queryByTestId('LoadingDesignationAccounts'),
      ).not.toBeInTheDocument();
    });

    expect(queryByTestId('Notification')).toBeInTheDocument();
  });

  it('empty', async () => {
    const { queryByTestId, getByText } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<{ DesignationAccounts: DesignationAccountsQuery }>
          mocks={emptyMocks}
        >
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

  it('renders nav list icon and onclick triggers onNavListToggle', async () => {
    onNavListToggle.mockClear();
    const { getByTestId } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<{ DesignationAccounts: DesignationAccountsQuery }>
          mocks={mocks}
        >
          <DesignationAccountsReport
            accountListId={accountListId}
            isNavListOpen={true}
            title={title}
            onNavListToggle={onNavListToggle}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    expect(getByTestId('ReportsMenuIcon')).toBeInTheDocument();
    userEvent.click(getByTestId('ReportsMenuIcon'));
    await waitFor(() => expect(onNavListToggle).toHaveBeenCalled());
  });
});
