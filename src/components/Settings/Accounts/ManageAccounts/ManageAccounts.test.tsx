import { PropsWithChildren } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { Box } from '@mui/system';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { I18nextProvider } from 'react-i18next';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { AppSettingsProvider } from 'src/components/common/AppSettings/AppSettingsProvider';
import { InviteTypeEnum } from 'src/graphql/types.generated';
import i18n from 'src/lib/i18n';
import theme from '../../../../theme';
import { ManageAccounts } from './ManageAccounts';
import {
  GetAccountListInvitesQuery,
  GetUserIdQuery,
} from './ManageAccounts.generated';

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

const accountsSharingWith = [
  {
    id: '111',
    firstName: 'userFirstname1',
    lastName: 'userLastname1',
  },
  {
    id: 'userID',
    firstName: 'userFirstname2',
    lastName: 'userLastname2',
  },
];

const getAccountListInvitesMock = {
  GetAccountListInvites: {
    accountListInvites: {
      nodes: [
        {
          id: '1',
          accountListId: 'accountListId',
          cancelledByUser: null,
          inviteUserAs: InviteTypeEnum.User,
          invitedByUser: {
            firstName: 'InviteFirstname',
            lastName: 'InviteLastname',
            id: '11',
          },
          recipientEmail: 'recipientEmail',
        },
        {
          id: '2',
          accountListId: 'accountListId2',
          cancelledByUser: null,
          inviteUserAs: InviteTypeEnum.Coach,
          invitedByUser: {
            firstName: 'InviteFirstname2',
            lastName: 'InviteLastname2',
            id: '22',
          },
          recipientEmail: 'recipientEmail2',
        },
      ],
    },
  },
};

const getUserIdMock = {
  GetUserId: {
    user: {
      id: 'userID',
    },
  },
};

const UserIntro = (): React.ReactElement => <Box>This is the User intro.</Box>;
const CoachIntro = (): React.ReactElement => (
  <Box>This is the Coach intro.</Box>
);

const Components = ({ children }: PropsWithChildren) => (
  <SnackbarProvider>
    <TestRouter router={router}>
      <ThemeProvider theme={theme}>
        <I18nextProvider i18n={i18n}>
          <AppSettingsProvider>{children}</AppSettingsProvider>
        </I18nextProvider>
      </ThemeProvider>
    </TestRouter>
  </SnackbarProvider>
);

describe('ManageAccounts', () => {
  const handleRemoveAccount = jest.fn();

  beforeEach(() => {
    handleRemoveAccount.mockClear();
  });

  it('should show loading and User intro', async () => {
    const { getByText, queryByText, queryByTestId } = render(
      <Components>
        <GqlMockedProvider<{
          GetAccountListInvites: GetAccountListInvitesQuery;
          getUserId: GetUserIdQuery;
        }>
          mocks={{
            GetAccountListInvites: {
              accountListInvites: {
                nodes: [],
              },
            },
            ...getUserIdMock,
          }}
        >
          <ManageAccounts
            type={InviteTypeEnum.User}
            intro={<UserIntro />}
            loading={true}
            accountsSharingWith={[]}
            handleRemoveAccount={handleRemoveAccount}
          />
        </GqlMockedProvider>
      </Components>,
    );

    await waitFor(() => {
      expect(getByText('This is the User intro.')).toBeInTheDocument();
      expect(
        queryByText('Account currently shared with'),
      ).not.toBeInTheDocument();
      expect(queryByText('Pending Invites')).not.toBeInTheDocument();
      expect(queryByTestId('invitesLoading')).not.toBeInTheDocument();
    });
  });

  it('should load data correctly', async () => {
    const { getByText } = render(
      <Components>
        <GqlMockedProvider<{
          GetAccountListInvites: GetAccountListInvitesQuery;
          getUserId: GetUserIdQuery;
        }>
          mocks={{
            ...getAccountListInvitesMock,
            ...getUserIdMock,
          }}
        >
          <ManageAccounts
            type={InviteTypeEnum.User}
            intro={<UserIntro />}
            loading={false}
            accountsSharingWith={accountsSharingWith}
            handleRemoveAccount={handleRemoveAccount}
          />
        </GqlMockedProvider>
      </Components>,
    );

    await waitFor(() => {
      expect(getByText('Account currently shared with')).toBeInTheDocument();
      expect(getByText('Pending Invites')).toBeInTheDocument();
    });

    expect(getByText('userFirstname1 userLastname1')).toBeInTheDocument();
    expect(getByText('userFirstname2 userLastname2')).toBeInTheDocument();
    expect(
      getByText('(Sent by InviteFirstname InviteLastname)'),
    ).toBeInTheDocument();
  });

  it('should not show who invited the user if no name', async () => {
    const { getByText, queryByText } = render(
      <Components>
        <GqlMockedProvider<{
          GetAccountListInvites: GetAccountListInvitesQuery;
          getUserId: GetUserIdQuery;
        }>
          mocks={{
            GetAccountListInvites: {
              accountListInvites: {
                nodes: [
                  {
                    id: '1',
                    accountListId: 'accountListId',
                    cancelledByUser: null,
                    inviteUserAs: InviteTypeEnum.Coach,
                    invitedByUser: {
                      id: '11',
                    },
                    recipientEmail: 'recipientEmail',
                  },
                ],
              },
            },
            ...getUserIdMock,
          }}
        >
          <ManageAccounts
            type={InviteTypeEnum.User}
            intro={<UserIntro />}
            loading={false}
            accountsSharingWith={accountsSharingWith}
            handleRemoveAccount={handleRemoveAccount}
          />
        </GqlMockedProvider>
      </Components>,
    );

    await waitFor(() => {
      expect(getByText('recipientEmail')).toBeInTheDocument();
      expect(
        queryByText('(Sent by InviteFirstname InviteLastname)'),
      ).not.toBeInTheDocument();
    });
  });

  it('should remove users and pending invites', async () => {
    const mutationSpy = jest.fn();
    const { findAllByRole, getByText, getAllByRole } = render(
      <Components>
        <GqlMockedProvider<{
          GetAccountListInvites: GetAccountListInvitesQuery;
          getUserId: GetUserIdQuery;
        }>
          onCall={mutationSpy}
          mocks={{
            ...getAccountListInvitesMock,
            ...getUserIdMock,
          }}
        >
          <ManageAccounts
            type={InviteTypeEnum.User}
            intro={<UserIntro />}
            loading={false}
            accountsSharingWith={accountsSharingWith}
            handleRemoveAccount={handleRemoveAccount}
          />
        </GqlMockedProvider>
      </Components>,
    );

    expect(getByText('Account currently shared with')).toBeInTheDocument();

    // There are two accounts, but one of them can't be deleted because it is the user's own account
    const deleteAccessButtons = await findAllByRole('button', {
      name: 'Delete access',
    });
    expect(deleteAccessButtons).toHaveLength(1);
    userEvent.click(deleteAccessButtons[0]);
    await waitFor(() => {
      expect(handleRemoveAccount).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(getByText('Pending Invites')).toBeInTheDocument();
    });
    const deleteInviteButtons = getAllByRole('button', {
      name: 'Delete invite',
    });
    expect(deleteInviteButtons).toHaveLength(2);
    userEvent.click(deleteInviteButtons[0]);
    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith(
        'MPDX removed the invite successfully',
        {
          variant: 'success',
        },
      );
    });

    expect(mutationSpy.mock.calls[2][0].operation.operationName).toEqual(
      'CancelAccountListInvite',
    );
    expect(mutationSpy.mock.calls[2][0].operation.variables.input).toEqual({
      accountListId: 'account-list-1',
      id: '1',
    });
  });

  it('should remove a coach', async () => {
    const mutationSpy = jest.fn();
    const { getByText, getAllByRole, queryByText } = render(
      <Components>
        <GqlMockedProvider<{
          GetAccountListInvites: GetAccountListInvitesQuery;
          getUserId: GetUserIdQuery;
        }>
          onCall={mutationSpy}
          mocks={{
            ...getAccountListInvitesMock,
            ...getUserIdMock,
          }}
        >
          <ManageAccounts
            type={InviteTypeEnum.Coach}
            intro={CoachIntro()}
            loading={false}
            accountsSharingWith={accountsSharingWith}
            handleRemoveAccount={handleRemoveAccount}
          />
        </GqlMockedProvider>
      </Components>,
    );

    expect(getByText('Account currently coached by')).toBeInTheDocument();
    expect(
      queryByText('Account currently shared with'),
    ).not.toBeInTheDocument();

    await waitFor(() => {
      expect(getByText('Pending Invites')).toBeInTheDocument();
    });

    const deleteButtons = getAllByRole('button', { name: 'Delete invite' });
    expect(deleteButtons).toHaveLength(2);
    userEvent.click(deleteButtons[1]);
    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith(
        'MPDX removed the coaching invite successfully',
        {
          variant: 'success',
        },
      );
    });

    await waitFor(() => {
      expect(getAllByRole('button', { name: 'Delete invite' })).toHaveLength(1);
    });
  });
});
