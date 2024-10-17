import React from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApolloErgonoMockMap } from 'graphql-ergonomock';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { FinancialAccounts } from './FinancialAccounts';
import { FinancialAccountsQuery } from './FinancialAccounts.generated';
import {
  FinancialAccountsEmptyMock,
  FinancialAccountsErrorMock,
  FinancialAccountsMock,
} from './FinancialAccountsMocks';

jest.mock('next/router', () => ({
  useRouter: () => {
    return {
      query: { accountListId: 'abc' },
      isReady: true,
    };
  },
}));

const accountListId = '111';
const onNavListToggle = jest.fn();
const mutationSpy = jest.fn();

interface ComponentsProps {
  mocks?: ApolloErgonoMockMap;
  designationAccounts?: string[];
  useErrorMockedProvider?: boolean;
}
const Components: React.FC<ComponentsProps> = ({
  mocks,
  designationAccounts = [],
  useErrorMockedProvider = false,
}) => (
  <ThemeProvider theme={theme}>
    {useErrorMockedProvider ? (
      <MockedProvider mocks={[FinancialAccountsErrorMock]}>
        <FinancialAccounts
          accountListId={accountListId}
          isNavListOpen={true}
          designationAccounts={designationAccounts}
          handleNavListToggle={onNavListToggle}
        />
      </MockedProvider>
    ) : (
      <GqlMockedProvider<{ FinancialAccounts: FinancialAccountsQuery }>
        mocks={mocks}
        onCall={mutationSpy}
      >
        <FinancialAccounts
          accountListId={accountListId}
          isNavListOpen={true}
          designationAccounts={designationAccounts}
          handleNavListToggle={onNavListToggle}
        />
      </GqlMockedProvider>
    )}
  </ThemeProvider>
);

describe('FinancialAccounts', () => {
  beforeEach(() => {
    onNavListToggle.mockClear();
  });
  it('default', async () => {
    const { getByText, getByTestId, queryByTestId } = render(
      <Components mocks={FinancialAccountsMock} />,
    );

    await waitFor(() => {
      expect(queryByTestId('LoadingFinancialAccounts')).not.toBeInTheDocument();
    });

    expect(getByText('Responsibility Centers')).toBeInTheDocument();
    expect(getByText('-CA$3,500')).toBeInTheDocument();
    expect(queryByTestId('Notification')).not.toBeInTheDocument();
    expect(getByTestId('AccountsGroupList')).toBeInTheDocument();
    expect(getByTestId('FinancialAccountsScrollBox')).toBeInTheDocument();
  });

  it('renders nav list icon and onclick triggers onNavListToggle', async () => {
    const { getByTestId } = render(
      <Components mocks={FinancialAccountsMock} />,
    );

    expect(getByTestId('ReportsFilterIcon')).toBeInTheDocument();
    userEvent.click(getByTestId('ReportsFilterIcon'));
    await waitFor(() => expect(onNavListToggle).toHaveBeenCalled());
  });

  it('loading', async () => {
    const { queryByTestId, getByText } = render(
      <Components mocks={FinancialAccountsMock} />,
    );

    expect(getByText('Responsibility Centers')).toBeInTheDocument();
    expect(queryByTestId('LoadingFinancialAccounts')).toBeInTheDocument();
    expect(queryByTestId('Notification')).not.toBeInTheDocument();
  });

  it('error', async () => {
    const { queryByTestId } = render(<Components useErrorMockedProvider />);

    await waitFor(() => {
      expect(queryByTestId('LoadingFinancialAccounts')).not.toBeInTheDocument();
    });

    expect(queryByTestId('Notification')).toBeInTheDocument();
  });

  it('empty', async () => {
    const { queryByTestId } = render(
      <Components mocks={FinancialAccountsEmptyMock} />,
    );

    await waitFor(() => {
      expect(queryByTestId('LoadingFinancialAccounts')).not.toBeInTheDocument();
    });

    expect(queryByTestId('EmptyReport')).toBeInTheDocument();
  });

  it('filters report by designation account', async () => {
    render(
      <Components
        mocks={FinancialAccountsMock}
        designationAccounts={['account-1']}
      />,
    );

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('FinancialAccounts', {
        designationAccountIds: ['account-1'],
      }),
    );
  });

  it('does not filter report by designation account', async () => {
    render(<Components mocks={FinancialAccountsMock} />);

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('FinancialAccounts', {
        designationAccountIds: null,
      }),
    );
  });
});
