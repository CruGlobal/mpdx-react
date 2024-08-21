import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApolloErgonoMockMap } from 'graphql-ergonomock';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { OrganizationsAccountList } from 'src/graphql/types.generated';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import theme from '../../../../../theme';
import { AccountListsMocks } from '../AccountLists.mock';
import { AccountListRow } from './AccountListRow';

jest.mock('next-auth/react');

const accountListId = 'account-list-1';
const contactId = 'contact-1';
const router = {
  query: { accountListId, contactId: [contactId] },
  isReady: true,
};

const mockEnqueue = jest.fn();
jest.mock('src/hooks/useGetAppSettings');
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

type TestComponentProps = {
  accountList: OrganizationsAccountList;
  mocks?: ApolloErgonoMockMap;
  search?: string;
  organizationId?: string;
};

const Components: React.FC<TestComponentProps> = ({
  accountList,
  mocks = {},
}) => (
  <SnackbarProvider>
    <TestRouter router={router}>
      <GqlMockedProvider onCall={mutationSpy} mocks={mocks}>
        <ThemeProvider theme={theme}>
          <AccountListRow
            accountList={accountList}
            search=""
            organizationId=""
          />
        </ThemeProvider>
      </GqlMockedProvider>
    </TestRouter>
  </SnackbarProvider>
);

describe('AccountLists', () => {
  beforeEach(() => {
    (useGetAppSettings as jest.Mock).mockReturnValue({
      appName: 'MPDX',
    });
  });
  it('should show details', () => {
    const { getByText, queryByText } = render(
      <Components accountList={accountList} search="" organizationId="" />,
    );
    expect(getByText('Test Account List Name')).toBeInTheDocument();

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
        search=""
        organizationId=""
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
        search=""
        organizationId=""
      />,
    );

    expect(queryByText('No users')).not.toBeInTheDocument();
    expect(queryByText('No coaches')).not.toBeInTheDocument();
    expect(getByText('inviteUser@cru.org')).toBeInTheDocument();
    expect(getByText('inviteCoach@cru.org')).toBeInTheDocument();
  });

  describe('Handling Deletions', () => {
    it('should delete an accountList', async () => {
      const { getByRole, getByText, getByTestId } = render(
        <Components accountList={accountList} search="" organizationId="" />,
      );
      const reason = 'Because I am an admin';

      userEvent.hover(getByTestId('DeleteAccountListButton'));
      await waitFor(() => {
        expect(getByText('Permanently delete this account.')).toBeVisible();
      });

      userEvent.click(getByRole('button', { name: 'Delete Account' }));
      const reasonTextField = getByRole('textbox', { name: 'Reason' });
      userEvent.type(reasonTextField, reason);
      userEvent.click(getByRole('button', { name: 'Yes' }));

      await waitFor(() => {
        expect(mutationSpy).toHaveGraphqlOperation('DeleteAccountList', {
          input: { accountListId: '1111', reason },
        });

        expect(mockEnqueue).toHaveBeenCalledWith(
          'Deletion process enqueued: Test Account List Name',
          {
            variant: 'success',
          },
        );
      });
    });

    it('should not show delete icon if the account list is in more than 1 organization', async () => {
      const alteredAccountList = { ...accountList };
      alteredAccountList.organizationCount = 2;
      const { queryByTestId } = render(
        <SnackbarProvider>
          <TestRouter router={router}>
            <GqlMockedProvider onCall={mutationSpy}>
              <ThemeProvider theme={theme}>
                <AccountListRow
                  accountList={alteredAccountList}
                  search=""
                  organizationId=""
                />
              </ThemeProvider>
            </GqlMockedProvider>
          </TestRouter>
        </SnackbarProvider>,
      );

      expect(queryByTestId('DeleteAccountListButton')).not.toBeInTheDocument();
    });

    it('should delete users', async () => {
      const { getAllByRole, getByRole } = render(
        <Components accountList={accountList} search="" organizationId="" />,
      );
      const firstDeleteButton = getAllByRole('button', { name: 'Delete' })[0];
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
          'Deletion process enqueued: userFirstName userLastName. Check back later to see the updated data.',
          {
            variant: 'success',
          },
        );
      });
    });

    it('should remove coaches', async () => {
      const { getAllByRole, getByRole } = render(
        <Components accountList={accountList} search="" organizationId="" />,
      );

      userEvent.click(getAllByRole('button', { name: 'Remove Coach' })[0]);

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
      const { getAllByRole, getByRole } = render(
        <Components accountList={accountList} search="" organizationId="" />,
      );

      userEvent.click(getAllByRole('button', { name: 'Remove User' })[0]);

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
  describe('handling error state', () => {
    it('Should render the error state of deleting a user', async () => {
      const { getByRole, getAllByRole } = render(
        <Components
          accountList={accountList}
          search=""
          organizationId=""
          mocks={{
            DeleteUser: () => {
              throw new Error('Server Error');
            },
          }}
        />,
      );
      const firstDeleteButton = getAllByRole('button', { name: 'Delete' })[0];
      userEvent.click(firstDeleteButton);
      userEvent.type(
        getAllByRole('textbox', { name: 'Reason' })[0],
        'this is a test',
      );
      userEvent.click(getByRole('button', { name: 'Yes' }));

      await waitFor(() => {
        expect(mockEnqueue).toHaveBeenCalledWith(
          'MPDX could not delete user: userFirstName userLastName',
          {
            variant: 'error',
          },
        );
      });
    });

    it('Should render the error state of removing a user', async () => {
      const { getByRole, getAllByRole } = render(
        <Components
          accountList={accountList}
          search=""
          organizationId=""
          mocks={{
            RemoveAccountListUser: () => {
              throw new Error('Server Error');
            },
          }}
        />,
      );
      userEvent.click(getAllByRole('button', { name: 'Remove User' })[0]);

      userEvent.click(getByRole('button', { name: 'Yes' }));

      await waitFor(() => {
        expect(mockEnqueue).toHaveBeenCalledWith(
          'MPDX could not remove user: userFirstName userLastName',
          {
            variant: 'error',
          },
        );
      });
    });

    it('Should render the error state of removing a coach', async () => {
      const { getByRole, getAllByRole } = render(
        <Components
          accountList={accountList}
          mocks={{
            AdminDeleteOrganizationCoach: () => {
              throw new Error('Server Error');
            },
          }}
        />,
      );
      userEvent.click(getAllByRole('button', { name: 'Remove Coach' })[0]);

      userEvent.click(getByRole('button', { name: 'Yes' }));

      await waitFor(() => {
        expect(mockEnqueue).toHaveBeenCalledWith(
          'MPDX could not remove coach: coachFirstName coachLastName',
          {
            variant: 'error',
          },
        );
      });
    });
  });
});
