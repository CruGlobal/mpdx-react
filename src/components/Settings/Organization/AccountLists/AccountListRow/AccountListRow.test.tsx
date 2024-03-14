import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '../../../../../../__tests__/util/graphqlMocking';
import theme from '../../../../../theme';
import { AccountListsMocks } from '../AccountLists.mock';
import { AccountListRow, AccountListRowProps } from './AccountListRow';

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
const accountList = new AccountListsMocks().accountList;

const mutationSpy = jest.fn();

const Components: React.FC<AccountListRowProps> = ({ accountList }) => (
  <SnackbarProvider>
    <TestRouter router={router}>
      <GqlMockedProvider onCall={mutationSpy}>
        <ThemeProvider theme={theme}>
          <AccountListRow accountList={accountList} />
        </ThemeProvider>
      </GqlMockedProvider>
    </TestRouter>
  </SnackbarProvider>
);

describe('AccountLists', () => {
  it('should show details', () => {
    const { getByText, queryByText } = render(
      <Components accountList={accountList} />,
    );
    expect(getByText('Name1')).toBeInTheDocument();

    expect(getByText('DisplayName (4791.0)')).toBeInTheDocument();
    expect(getByText('Agape Bulgaria')).toBeInTheDocument();

    expect(getByText('userEmail@cru.org')).toBeInTheDocument();
    expect(
      getByText('coachFirstName.coachLastName@cru.org'),
    ).toBeInTheDocument();
    expect(queryByText('No users')).not.toBeInTheDocument();
    expect(queryByText('No coaches')).not.toBeInTheDocument();
  });

  it('should show no users & no coaches', () => {
    const { getByText } = render(
      <Components
        accountList={{
          ...accountList,
          accountListUsers: [],
          accountListCoaches: [],
          accountListUsersInvites: [],
          accountListCoachInvites: [],
        }}
      />,
    );

    expect(getByText('No Users')).toBeInTheDocument();
    expect(getByText('No Coaches')).toBeInTheDocument();
  });

  it('should show invites', () => {
    const { getByText, queryByText } = render(
      <Components
        accountList={{
          ...accountList,
          accountListUsers: [],
          accountListCoaches: [],
        }}
      />,
    );

    expect(queryByText('No users')).not.toBeInTheDocument();
    expect(queryByText('No coaches')).not.toBeInTheDocument();
    expect(getByText('inviteUser@cru.org')).toBeInTheDocument();
    expect(getByText('inviteCoach@cru.org')).toBeInTheDocument();
  });

  describe('Handling Deletions', () => {
    it('should delete an accountList', async () => {
      const { getByRole } = render(<Components accountList={accountList} />);
      const reason = 'Because I am an admin';
      userEvent.click(getByRole('button', { name: 'Delete Account' }));
      const reasonTextField = getByRole('textbox', { name: 'Reason' });
      userEvent.type(reasonTextField, reason);
      userEvent.click(getByRole('button', { name: 'Yes' }));

      await waitFor(() => {
        expect(mutationSpy.mock.calls[0][0]).toMatchObject({
          operation: {
            operationName: 'DeleteAccountList',
            variables: {
              input: {
                accountListId: '1111',
                reason: reason,
              },
            },
          },
        });
        // });
        // await waitFor(() => {
        expect(mockEnqueue).toHaveBeenCalledWith(
          'Successfully deleted account: Name1',
          {
            variant: 'success',
          },
        );
      });
    });

    it('should delete users', async () => {
      const { getByText, getAllByRole, getByRole } = render(
        <Components accountList={accountList} />,
      );
      const firstDeleteButton = getAllByRole('button', { name: 'Delete' })[0];
      userEvent.hover(firstDeleteButton);
      await waitFor(() => {
        expect(getByText('Permanently delete this user.')).toBeVisible();
      });
      userEvent.click(firstDeleteButton);
      userEvent.type(
        getAllByRole('textbox', { name: 'Reason' })[0],
        'this is a test',
      );
      userEvent.click(getByRole('button', { name: 'Yes' }));

      await waitFor(() => {
        expect(mutationSpy.mock.calls[0][0]).toMatchObject({
          operation: {
            operationName: 'DeleteUser',
            variables: {
              input: {
                reason: 'this is a test',
                resettedUserId: 'e8a19920',
              },
            },
          },
        });

        expect(mockEnqueue).toHaveBeenCalledWith(
          'Successfully deleted user: userFirstName userLastName',
          {
            variant: 'success',
          },
        );
      });
    });

    it('should remove coaches', async () => {
      const { getAllByRole, getByRole, getByText } = render(
        <Components accountList={accountList} />,
      );

      userEvent.click(getAllByRole('button', { name: 'Remove' })[1]);
      await waitFor(() => {
        expect(
          getByText('Are you sure you want to remove'),
        ).toBeInTheDocument();
      });
      userEvent.click(getByRole('button', { name: 'Yes' }));

      await waitFor(() => {
        expect(mutationSpy.mock.calls[0][0]).toMatchObject({
          operation: {
            operationName: 'AdminDeleteOrganizationCoach',
            variables: {
              input: {
                accountListId: '1111',
                coachId: 'd10e6360',
              },
            },
          },
        });
      });
      expect(mockEnqueue).toHaveBeenCalledWith(
        'Successfully removed coach: coachFirstName coachLastName',
        {
          variant: 'success',
        },
      );
    });
    it('should remove users', async () => {
      const { getByText, getByTestId, getByRole } = render(
        <Components accountList={accountList} />,
      );

      userEvent.click(getByTestId('RemoveUserButton'));
      await waitFor(() => {
        expect(
          getByText('Are you sure you want to remove'),
        ).toBeInTheDocument();
      });
      userEvent.click(getByRole('button', { name: 'Yes' }));

      await waitFor(() => {
        return expect(mutationSpy.mock.calls[0][0]).toMatchObject({
          operation: {
            operationName: 'RemoveAccountListUser',
            variables: {
              input: {
                accountListId: '1111',
                userId: 'e8a19920',
              },
            },
          },
        });
      });
      expect(mockEnqueue).toHaveBeenCalledWith(
        'Successfully removed user: userFirstName userLastName',
        {
          variant: 'success',
        },
      );
    });
  });
});
