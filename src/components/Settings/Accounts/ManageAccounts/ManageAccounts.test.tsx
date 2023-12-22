import { PropsWithChildren } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { Box } from '@mui/system';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import * as Types from 'src/graphql/types.generated';
import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';
import theme from '../../../../theme';
import { CoachProp, ManageAccounts } from './ManageAccounts';
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
    id: '1',
    user: {
      id: '111',
      firstName: 'userFirstname1',
      lastName: 'userLastname1',
    },
  },
  {
    id: '2',
    user: {
      id: '22',
      firstName: 'userFirstname2',
      lastName: 'userLastname2',
    },
  },
];

const GetAccountListInvitesMock = {
  GetAccountListInvites: {
    accountListInvites: {
      nodes: [
        {
          id: '1',
          accountListId: 'accountListId',
          cancelledByUser: null,
          inviteUserAs: Types.InviteTypeEnum.User,
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
          inviteUserAs: Types.InviteTypeEnum.Coach,
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
const GetUserIdMock = {
  getUserId: {
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
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </TestRouter>
  </SnackbarProvider>
);

describe('ManageAccounts', () => {
  const handleRemoveItem = jest.fn();

  beforeEach(() => {
    handleRemoveItem.mockClear();
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
            ...GetUserIdMock,
          }}
        >
          <ManageAccounts
            type={Types.InviteTypeEnum.User}
            intro={UserIntro()}
            loadingItems={true}
            accountsSharingWith={[]}
            handleRemoveItem={handleRemoveItem}
          />
        </GqlMockedProvider>
        ,
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
            ...GetAccountListInvitesMock,
            ...GetUserIdMock,
          }}
        >
          <ManageAccounts
            type={Types.InviteTypeEnum.User}
            intro={UserIntro()}
            loadingItems={false}
            accountsSharingWith={accountsSharingWith}
            handleRemoveItem={handleRemoveItem}
          />
        </GqlMockedProvider>
        ,
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
                    inviteUserAs: Types.InviteTypeEnum.Coach,
                    invitedByUser: {
                      id: '11',
                    },
                    recipientEmail: 'recipientEmail',
                  },
                ],
              },
            },
            ...GetUserIdMock,
          }}
        >
          <ManageAccounts
            type={Types.InviteTypeEnum.User}
            intro={UserIntro()}
            loadingItems={false}
            accountsSharingWith={accountsSharingWith}
            handleRemoveItem={handleRemoveItem}
          />
        </GqlMockedProvider>
        ,
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
    const { getByText, getAllByLabelText } = render(
      <Components>
        <GqlMockedProvider<{
          GetAccountListInvites: GetAccountListInvitesQuery;
          getUserId: GetUserIdQuery;
        }>
          onCall={mutationSpy}
          mocks={{
            ...GetAccountListInvitesMock,
            ...GetUserIdMock,
          }}
        >
          <ManageAccounts
            type={Types.InviteTypeEnum.User}
            intro={UserIntro()}
            loadingItems={false}
            accountsSharingWith={accountsSharingWith}
            handleRemoveItem={handleRemoveItem}
          />
        </GqlMockedProvider>
        ,
      </Components>,
    );

    await waitFor(() => {
      expect(getByText('Account currently shared with')).toBeInTheDocument();
    });

    userEvent.click(getAllByLabelText('Delete Access')[0]);
    await waitFor(() => {
      expect(handleRemoveItem).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(getByText('Pending Invites')).toBeInTheDocument();
    });
    userEvent.click(getAllByLabelText('Delete invite')[0]);
    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith(
        '{{appName}} removed the invite successfully',
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
    const { getByText, getAllByLabelText, queryByText } = render(
      <Components>
        <GqlMockedProvider<{
          GetAccountListInvites: GetAccountListInvitesQuery;
          getUserId: GetUserIdQuery;
        }>
          onCall={mutationSpy}
          mocks={{
            ...GetAccountListInvitesMock,
            ...GetUserIdMock,
          }}
        >
          <ManageAccounts
            type={Types.InviteTypeEnum.Coach}
            intro={CoachIntro()}
            loadingItems={false}
            accountsSharingWith={
              [
                {
                  id: '111',
                  firstName: 'userFirstname1',
                  lastName: 'userLastname1',
                },
                {
                  id: '22',
                  firstName: 'userFirstname2',
                  lastName: 'userLastname2',
                },
              ] as CoachProp[]
            }
            handleRemoveItem={handleRemoveItem}
          />
        </GqlMockedProvider>
        ,
      </Components>,
    );

    await waitFor(() => {
      expect(getByText('Account currently coached by')).toBeInTheDocument();
      expect(
        queryByText('Account currently shared with'),
      ).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(getByText('Pending Invites')).toBeInTheDocument();
    });

    userEvent.click(getAllByLabelText('Delete invite')[1]);
    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith(
        '{{appName}} removed the coaching invite successfully',
        {
          variant: 'success',
        },
      );
    });

    await waitFor(() => {
      expect(getAllByLabelText('Delete invite')[1]).toBeFalsy();
    });
  });
});
