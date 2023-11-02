import { render, waitFor } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';
import theme from '../../../../theme';
import { ManageAccountAccessAccordian } from './ManageAccountAccessAccordian';
import {
  GetAccountsSharingWithQuery,
  GetAccountListInvitesQuery,
  GetUserIdQuery,
} from './ManageAccountAccess.generated';
import * as Types from '../../../../../graphql/types.generated';

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

const GetAccountsSharingWith = {
  GetAccountsSharingWith: {
    accountListUsers: {
      nodes: [
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
      ],
    },
  },
};
const GetAccountListInvitesMock = {
  GetAccountListInvites: {
    accountListInvites: {
      nodes: [
        {
          id: '1',
          accountListId: 'accountListId',
          cancelledByUser: null,
          inviteUserAs: Types.InviteTypeEnum.Coach,
          invitedByUser: {
            firstName: 'InviteFirstname',
            lastName: 'InviteLastname',
            id: '11',
          },
          recipientEmail: 'recipientEmail',
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

const handleAccordionChange = jest.fn();

const Components = (children: React.ReactElement) => (
  <SnackbarProvider>
    <TestRouter router={router}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </TestRouter>
  </SnackbarProvider>
);

describe('ManageAccountAccessAccordian', () => {
  it('should render accordian closed', async () => {
    const { getAllByText } = render(
      Components(
        <GqlMockedProvider>
          <ManageAccountAccessAccordian
            handleAccordionChange={handleAccordionChange}
            expandedPanel={''}
          />
        </GqlMockedProvider>,
      ),
    );
    expect(getAllByText('Manage Account Access')[0]).toBeInTheDocument();
  });
  it('should render accordian open', async () => {
    const { getByText } = render(
      Components(
        <GqlMockedProvider>
          <ManageAccountAccessAccordian
            handleAccordionChange={handleAccordionChange}
            expandedPanel={'Manage Account Access'}
          />
        </GqlMockedProvider>,
      ),
    );
    expect(
      getByText('Share this ministry account with other team members'),
    ).toBeInTheDocument();
  });

  it('should not show pending invites or account shared with', async () => {
    const { queryByText } = render(
      Components(
        <GqlMockedProvider<{
          GetAccountsSharingWith: GetAccountsSharingWithQuery;
          GetAccountListInvites: GetAccountListInvitesQuery;
        }>
          mocks={{
            GetAccountsSharingWith: {
              accountListUsers: {
                nodes: [],
              },
            },
            GetAccountListInvites: {
              accountListInvites: {
                nodes: [],
              },
            },
          }}
        >
          <ManageAccountAccessAccordian
            handleAccordionChange={handleAccordionChange}
            expandedPanel={'Manage Account Access'}
          />
        </GqlMockedProvider>,
      ),
    );

    expect(
      queryByText('Account currently shared with'),
    ).not.toBeInTheDocument();
    expect(queryByText('Pending Invites')).not.toBeInTheDocument();
  });

  it('should show pending invites or account shared with', async () => {
    const { getByText } = render(
      Components(
        <GqlMockedProvider<{
          GetAccountsSharingWith: GetAccountsSharingWithQuery;
          GetAccountListInvites: GetAccountListInvitesQuery;
          getUserId: GetUserIdQuery;
        }>
          mocks={{
            ...GetAccountsSharingWith,
            ...GetAccountListInvitesMock,
            ...GetUserIdMock,
          }}
        >
          <ManageAccountAccessAccordian
            handleAccordionChange={handleAccordionChange}
            expandedPanel={'Manage Account Access'}
          />
        </GqlMockedProvider>,
      ),
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

  it('should not show certain users', async () => {
    const { getByText, queryByText } = render(
      Components(
        <GqlMockedProvider<{
          GetAccountsSharingWith: GetAccountsSharingWithQuery;
          GetAccountListInvites: GetAccountListInvitesQuery;
          getUserId: GetUserIdQuery;
        }>
          mocks={{
            ...GetAccountsSharingWith,
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
            getUserId: {
              user: {
                id: '1',
              },
            },
          }}
        >
          <ManageAccountAccessAccordian
            handleAccordionChange={handleAccordionChange}
            expandedPanel={'Manage Account Access'}
          />
        </GqlMockedProvider>,
      ),
    );

    await waitFor(() => {
      expect(getByText('userFirstname1 userLastname1')).toBeInTheDocument();
      expect(getByText('userFirstname2 userLastname2')).toBeInTheDocument();

      expect(getByText('recipientEmail')).toBeInTheDocument();
      expect(
        queryByText('(Sent by InviteFirstname InviteLastname)'),
      ).not.toBeInTheDocument();
    });
  });

  it('should remove a user & remove a invite', async () => {
    const mutationSpy = jest.fn();

    const { getByText, getAllByLabelText } = render(
      Components(
        <GqlMockedProvider<{
          GetAccountsSharingWith: GetAccountsSharingWithQuery;
          GetAccountListInvites: GetAccountListInvitesQuery;
          getUserId: GetUserIdQuery;
        }>
          onCall={mutationSpy}
          mocks={{
            ...GetAccountsSharingWith,
            ...GetAccountListInvitesMock,
            ...GetUserIdMock,
          }}
        >
          <ManageAccountAccessAccordian
            handleAccordionChange={handleAccordionChange}
            expandedPanel={'Manage Account Access'}
          />
        </GqlMockedProvider>,
      ),
    );

    await waitFor(() => {
      expect(getByText('Account currently shared with')).toBeInTheDocument();
    });
    userEvent.click(getAllByLabelText('Delete user')[0]);
    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith(
        'MPDX removed the user successfully',
        {
          variant: 'success',
        },
      );
    });

    await waitFor(() => {
      expect(getByText('Pending Invites')).toBeInTheDocument();
    });
    userEvent.click(getAllByLabelText('Delete invite')[0]);
    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith(
        'MPDX removed the invite successfully',
        {
          variant: 'success',
        },
      );
    });
  });

  it('should invite an user', async () => {
    const mutationSpy = jest.fn();

    const { getByText, getByTestId, getByRole, queryByText, queryByTestId } =
      render(
        Components(
          <GqlMockedProvider<{
            GetAccountsSharingWith: GetAccountsSharingWithQuery;
            GetAccountListInvites: GetAccountListInvitesQuery;
          }>
            onCall={mutationSpy}
            mocks={{
              GetAccountsSharingWith: {
                accountListUsers: {
                  nodes: [],
                },
              },
              GetAccountListInvites: {
                accountListInvites: {
                  nodes: [],
                },
              },
            }}
          >
            <ManageAccountAccessAccordian
              handleAccordionChange={handleAccordionChange}
              expandedPanel={'Manage Account Access'}
            />
          </GqlMockedProvider>,
        ),
      );

    await waitFor(() => {
      expect(
        getByText('Invite someone to share this account'),
      ).toBeInTheDocument();
      expect(queryByText('Pending Invites')).not.toBeInTheDocument();
    });
    expect(getByTestId('action-button')).toBeDisabled();

    userEvent.type(getByRole('textbox'), 'test@');

    await waitFor(() => {
      expect(getByText(/email must be a valid email/i)).toBeInTheDocument();
    });

    userEvent.type(getByRole('textbox'), 'test.org');

    await waitFor(() => {
      expect(
        queryByText(/email must be a valid email/i),
      ).not.toBeInTheDocument();
      expect(queryByTestId('action-button')).not.toBeDisabled();
    });

    userEvent.click(getByTestId('action-button'));

    await waitFor(() => {
      expect(getByText('Confirm')).toBeInTheDocument();
    });

    userEvent.click(getByText('Yes'));

    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith(
        'MPDX sent an invite to {{email}}',
        {
          variant: 'success',
        },
      );

      const createInviteCall = mutationSpy.mock.calls[3][0];
      expect(createInviteCall.operation.operationName).toEqual(
        'CreateAccountListInvite',
      );
      expect(createInviteCall.operation.variables.input.attributes).toEqual({
        accountListId: 'account-list-1',
        inviteUserAs: Types.InviteTypeEnum.User,
        recipientEmail: 'test@test.org',
      });
    });
  });
});
