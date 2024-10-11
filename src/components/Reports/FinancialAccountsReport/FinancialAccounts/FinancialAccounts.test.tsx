import React from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApolloErgonoMockMap } from 'graphql-ergonomock';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import {
  FinancialAccountContext,
  FinancialAccountType,
} from '../Context/FinancialAccountsContext';
import { FinancialAccounts } from './FinancialAccounts';
import {
  FinancialAccountsDocument,
  FinancialAccountsQuery,
} from './FinancialAccounts.generated';

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

const errorMock = {
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
    <FinancialAccountContext.Provider
      value={
        {
          accountListId,
          isNavListOpen: true,
          designationAccounts,
          handleNavListToggle: onNavListToggle,
        } as unknown as FinancialAccountType
      }
    >
      {useErrorMockedProvider ? (
        <MockedProvider mocks={[errorMock]}>
          <FinancialAccounts />
        </MockedProvider>
      ) : (
        <GqlMockedProvider<{ FinancialAccounts: FinancialAccountsQuery }>
          mocks={mocks}
          onCall={mutationSpy}
        >
          <FinancialAccounts />
        </GqlMockedProvider>
      )}
    </FinancialAccountContext.Provider>
  </ThemeProvider>
);

describe('FinancialAccounts', () => {
  beforeEach(() => {
    onNavListToggle.mockClear();
  });
  it('default', async () => {
    const { getByText, getByTestId, queryByTestId } = render(
      <Components mocks={mocks} />,
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
    const { getByTestId } = render(<Components mocks={mocks} />);

    expect(getByTestId('ReportsFilterIcon')).toBeInTheDocument();
    userEvent.click(getByTestId('ReportsFilterIcon'));
    await waitFor(() => expect(onNavListToggle).toHaveBeenCalled());
  });

  it('loading', async () => {
    const { queryByTestId, getByText } = render(<Components mocks={mocks} />);

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
    const { queryByTestId } = render(<Components mocks={emptyMocks} />);

    await waitFor(() => {
      expect(queryByTestId('LoadingFinancialAccounts')).not.toBeInTheDocument();
    });

    expect(queryByTestId('EmptyReport')).toBeInTheDocument();
  });

  it('filters report by designation account', async () => {
    render(<Components mocks={mocks} designationAccounts={['account-1']} />);

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('FinancialAccounts', {
        designationAccountIds: ['account-1'],
      }),
    );
  });

  it('does not filter report by designation account', async () => {
    render(<Components mocks={mocks} />);

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('FinancialAccounts', {
        designationAccountIds: null,
      }),
    );
  });
});
