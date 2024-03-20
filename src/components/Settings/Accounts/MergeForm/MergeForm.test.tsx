import { PropsWithChildren } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';
import theme from '../../../../theme';
import { MergeForm } from './MergeForm';
import {
  AccountListQuery,
  GetAccountListsForMergingQuery,
} from './MergeForm.generated';

jest.mock('next-auth/react');

const accountListId = 'account-list-1';
const contactId = 'contact-1';
const router = {
  query: { accountListId, contactId: [contactId] },
  isReady: true,
};

const mockEnqueue = jest.fn();
jest.mock('notistack', () => ({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ...jest.requireActual('notistack'),
  useSnackbar: () => {
    return {
      enqueueSnackbar: mockEnqueue,
    };
  },
}));

const getAccountListsForMergingMock = {
  GetAccountListsForMerging: {
    accountLists: {
      nodes: [
        {
          id: '123',
          name: 'AmericanUser',
          currency: 'USD',
        },
        {
          id: '321',
          name: 'BritishUser',
          currency: 'GBP',
        },
      ],
    },
  },
};

const accountListMock = {
  AccountList: {
    accountList: {
      id: '456',
      name: 'AccountListUser',
    },
  },
};

const Components = ({ children }: PropsWithChildren) => (
  <SnackbarProvider>
    <TestRouter router={router}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </TestRouter>
  </SnackbarProvider>
);

describe('MergeAccountsAccordion', () => {
  it('should not show the merge form', async () => {
    const { queryByText } = render(
      <Components>
        <GqlMockedProvider<{
          GetAccountListsForMerging: GetAccountListsForMergingQuery;
          AccountList: AccountListQuery;
        }>
          mocks={{
            GetAccountListsForMerging: {
              accountLists: {
                nodes: [],
              },
            },
            ...accountListMock,
          }}
        >
          <MergeForm isSpouse={false} />
        </GqlMockedProvider>
      </Components>,
    );
    expect(queryByText('Merging From')).not.toBeInTheDocument();
  });
  it('should render the merge form', async () => {
    const { getByText, getByRole, getByTestId, queryByTestId } = render(
      <Components>
        <GqlMockedProvider<{
          GetAccountListsForMerging: GetAccountListsForMergingQuery;
          AccountList: AccountListQuery;
        }>
          mocks={{
            ...getAccountListsForMergingMock,
            ...accountListMock,
          }}
        >
          <MergeForm isSpouse={false} />
        </GqlMockedProvider>
      </Components>,
    );
    await waitFor(() => {
      expect(getByText('Merging From')).toBeInTheDocument();
    });

    expect(queryByTestId('KeyboardArrowRightIcon')).not.toBeInTheDocument();

    userEvent.click(
      getByRole('combobox', {
        name: /select an account/i,
      }),
    );
    await waitFor(() => {
      userEvent.click(getByRole('option', { name: 'AmericanUser (123)' }));
    });
    userEvent.click(
      getByRole('checkbox', {
        name: 'This account merge cannot be undone, I accept.',
      }),
    );
    await waitFor(() => {
      expect(getByTestId('action-button')).not.toBeDisabled();
    });
  });

  it('should render arrow for spouse', async () => {
    const { getByTestId } = render(
      <Components>
        <GqlMockedProvider<{
          GetAccountListsForMerging: GetAccountListsForMergingQuery;
          AccountList: AccountListQuery;
        }>
          mocks={{
            ...getAccountListsForMergingMock,
            ...accountListMock,
          }}
        >
          <MergeForm isSpouse={true} />
        </GqlMockedProvider>
      </Components>,
    );
    await waitFor(() => {
      expect(getByTestId('KeyboardArrowRightIcon')).toBeInTheDocument();
    });
  });

  it('should fire merge mutation', async () => {
    const mutationSpy = jest.fn();
    const { getByText, getByRole, getByTestId } = render(
      <Components>
        <GqlMockedProvider<{
          GetAccountListsForMerging: GetAccountListsForMergingQuery;
          AccountList: AccountListQuery;
        }>
          onCall={mutationSpy}
          mocks={{
            ...getAccountListsForMergingMock,
            ...accountListMock,
          }}
        >
          <MergeForm isSpouse={false} />
        </GqlMockedProvider>
      </Components>,
    );
    await waitFor(() => {
      expect(getByText('Merging From')).toBeInTheDocument();
    });

    userEvent.click(
      getByRole('combobox', {
        name: /select an account/i,
      }),
    );
    await waitFor(() => {
      userEvent.click(getByRole('option', { name: 'AmericanUser (123)' }));
    });
    userEvent.click(
      getByRole('checkbox', {
        name: 'This account merge cannot be undone, I accept.',
      }),
    );
    userEvent.click(getByTestId('action-button'));

    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith(
        '{{appName}} merged your account successfully',
        {
          variant: 'success',
        },
      );

      const createInviteCall = mutationSpy.mock.calls[2][0];
      expect(createInviteCall.operation.operationName).toEqual(
        'MergeAccountList',
      );
      expect(createInviteCall.operation.variables.input).toEqual({
        losingAccountListId: '123',
        winningAccountListId: '456',
      });
    });
  });
});
