import { PropsWithChildren } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { OrganizationsContextProvider } from 'pages/accountLists/[accountListId]/settings/organizations.page';
import theme from '../../../../theme';
import {
  CreateOrganizationInviteMutation,
  OrganizationAdminsQuery,
  OrganizationInvitesQuery,
} from './ManageOrganizationAccess.generated';
import { ManageOrganizationAccessAccordion } from './ManageOrganizationAccessAccordion';

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

const handleAccordionChange = jest.fn();

const selectedOrganizationId = 'org111';
const Components = ({ children }: PropsWithChildren) => (
  <SnackbarProvider>
    <TestRouter router={router}>
      <ThemeProvider theme={theme}>
        <OrganizationsContextProvider
          selectedOrganizationId={selectedOrganizationId}
        >
          {children}
        </OrganizationsContextProvider>
      </ThemeProvider>
    </TestRouter>
  </SnackbarProvider>
);

const OrganizationAdminsMock = {
  OrganizationAdmins: {
    organizationAdmins: [
      {
        id: '1',
        firstName: 'firstName1',
        lastName: 'lastname1',
      },
      {
        id: '2',
        firstName: 'firstName2',
        lastName: 'lastname2',
      },
    ],
  },
};
const OrganizationInvitesMock = {
  OrganizationInvites: {
    organizationInvites: [
      {
        id: '111',
        acceptedAt: '2023-11-03',
        createdAt: '2023-11-03',
        code: 'code',
        inviteUserAs: 'coach',
        recipientEmail: 'recipientEmail',
      },
    ],
  },
};

describe('ManageOrganizationAccessAccordion', () => {
  const fetch = jest.fn().mockResolvedValue({
    json: () => Promise.resolve({ errors: [] }),
    status: 200,
  });
  beforeEach(() => {
    window.fetch = fetch;
  });

  it('should render accordion closed', async () => {
    const { queryByText } = render(
      <Components>
        <GqlMockedProvider>
          <ManageOrganizationAccessAccordion
            handleAccordionChange={handleAccordionChange}
            expandedPanel={''}
          />
        </GqlMockedProvider>
      </Components>,
    );
    expect(
      queryByText('Share this organization with other team members'),
    ).not.toBeInTheDocument();
  });
  it('should not show invites or shared', async () => {
    const mutationSpy = jest.fn();

    const { getByText, queryByText } = render(
      <Components>
        <GqlMockedProvider<{
          OrganizationAdminsMock: OrganizationAdminsQuery;
          OrganizationInvitesMock: OrganizationInvitesQuery;
        }>
          onCall={mutationSpy}
          mocks={{
            OrganizationAdmins: {
              organizationAdmins: [],
            },
            OrganizationInvites: {
              organizationInvites: [],
            },
          }}
        >
          <ManageOrganizationAccessAccordion
            handleAccordionChange={handleAccordionChange}
            expandedPanel={'Manage Organization Access'}
          />
        </GqlMockedProvider>
      </Components>,
    );
    expect(
      getByText('Share this organization with other team members'),
    ).toBeVisible();

    await waitFor(() => {
      expect(
        queryByText('Organization currently shared with'),
      ).not.toBeInTheDocument();
      expect(queryByText('Pending Invites')).not.toBeInTheDocument();
    });
  });

  it('should render invites and handle delete invite', async () => {
    const mutationSpy = jest.fn();

    const { getByText, getAllByLabelText } = render(
      <Components>
        <GqlMockedProvider<{
          OrganizationAdminsMock: OrganizationAdminsQuery;
          OrganizationInvitesMock: OrganizationInvitesQuery;
        }>
          onCall={mutationSpy}
          mocks={{
            ...OrganizationAdminsMock,
            ...OrganizationInvitesMock,
          }}
        >
          <ManageOrganizationAccessAccordion
            handleAccordionChange={handleAccordionChange}
            expandedPanel={'Manage Organization Access'}
          />
        </GqlMockedProvider>
      </Components>,
    );
    await waitFor(() => {
      expect(getByText('Pending Invites')).toBeInTheDocument();
    });
    expect(getByText('recipientEmail')).toBeInTheDocument();
    expect(getByText('Invited as coach on Nov 3, 2023')).toBeInTheDocument();

    userEvent.click(getAllByLabelText('Delete Invite')[0]);
    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith(
        'Removed the invite successfully',
        {
          variant: 'success',
        },
      );
    });
    expect(mutationSpy.mock.calls[2][0].operation.operationName).toEqual(
      'DestroyOrganizationInvite',
    );
    expect(mutationSpy.mock.calls[2][0].operation.variables.input).toEqual({
      organizationId: 'org111',
      inviteId: '111',
    });
  });

  it('should render admin and handle delete', async () => {
    const mutationSpy = jest.fn();

    const { getByText, getAllByLabelText } = render(
      <Components>
        <GqlMockedProvider<{
          OrganizationAdminsMock: OrganizationAdminsQuery;
          OrganizationInvitesMock: OrganizationInvitesQuery;
        }>
          onCall={mutationSpy}
          mocks={{
            ...OrganizationAdminsMock,
            ...OrganizationInvitesMock,
          }}
        >
          <ManageOrganizationAccessAccordion
            handleAccordionChange={handleAccordionChange}
            expandedPanel={'Manage Organization Access'}
          />
        </GqlMockedProvider>
      </Components>,
    );
    await waitFor(() => {
      expect(
        getByText('Organization currently shared with'),
      ).toBeInTheDocument();
    });

    expect(getByText('firstName1 lastname1')).toBeInTheDocument();
    userEvent.click(getAllByLabelText('Delete Admin')[0]);

    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith(
        'Removed the admin successfully',
        {
          variant: 'success',
        },
      );
    });

    expect(mutationSpy.mock.calls[2][0].operation.operationName).toEqual(
      'DestroyOrganizationAdmin',
    );
    expect(mutationSpy.mock.calls[2][0].operation.variables.input).toEqual({
      organizationId: 'org111',
      adminId: '1',
    });
  });

  it('should invite someone to manage organization', async () => {
    const mutationSpy = jest.fn();

    const { getByText, getByTestId } = render(
      <Components>
        <GqlMockedProvider<{
          OrganizationAdminsMock: OrganizationAdminsQuery;
          OrganizationInvitesMock: OrganizationInvitesQuery;
          CreateOrganizationInvite: CreateOrganizationInviteMutation;
        }>
          onCall={mutationSpy}
          mocks={{
            ...OrganizationAdminsMock,
            ...OrganizationInvitesMock,
            CreateOrganizationInvite: {
              createOrganizationInvite: {
                id: '222',
                acceptedAt: '2023-11-03',
                createdAt: '2023-11-03',
                code: 'code',
                inviteUserAs: 'coach',
                recipientEmail: 'invitedRecipientEmail',
              },
            },
          }}
        >
          <ManageOrganizationAccessAccordion
            handleAccordionChange={handleAccordionChange}
            expandedPanel={'Manage Organization Access'}
          />
        </GqlMockedProvider>
      </Components>,
    );
    await waitFor(() => {
      expect(
        getByText('Invite someone to administer this organization:'),
      ).toBeInTheDocument();
    });
    expect(getByTestId('action-button')).toBeDisabled();
    userEvent.type(getByTestId('inviteUsername'), 'test@');
    await waitFor(() => {
      expect(getByText('username must be a valid email')).toBeInTheDocument();
    });
    userEvent.type(getByTestId('inviteUsername'), 'test.org');
    await waitFor(() => {
      expect(getByTestId('action-button')).not.toBeDisabled();
    });

    userEvent.click(getByTestId('action-button'));
    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith(
        ' sent an invite to test@test.org',
        {
          variant: 'success',
        },
      );
    });

    expect(mutationSpy.mock.calls[2][0].operation.operationName).toEqual(
      'CreateOrganizationInvite',
    );
    expect(mutationSpy.mock.calls[2][0].operation.variables.input).toEqual({
      organizationId: 'org111',
      recipientEmail: 'test@test.org',
    });

    await waitFor(() => {
      expect(getByText('Pending Invites')).toBeInTheDocument();
      expect(getByText('invitedRecipientEmail')).toBeInTheDocument();
    });
  });
});
