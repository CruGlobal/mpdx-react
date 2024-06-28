import { PropsWithChildren } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from '../../../../../../theme';
import { AccountListCoachesOrUsers } from './AccountListCoachesOrUsers';

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

const Components = ({ children }: PropsWithChildren) => (
  <SnackbarProvider>
    <TestRouter router={router}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </TestRouter>
  </SnackbarProvider>
);

const userAccountListItems = [
  {
    __typename: 'AccountListUsers' as const,
    id: 'e8a19920',
    userFirstName: 'userFirstName1',
    userLastName: 'userLastName1',
    allowDeletion: false,
    organizationCount: 1,
    userEmailAddresses: [
      {
        id: '507548d6',
        email: 'userEmail1@cru.org',
        primary: true,
      },
    ],
  },
  {
    __typename: 'AccountListUsers' as const,
    id: '9ef19920',
    userFirstName: 'userFirstName2',
    userLastName: 'userLastName2',
    allowDeletion: true,
    organizationCount: 2,
    userEmailAddresses: [
      {
        id: '930548d6',
        email: 'userEmail2@cru.org',
        primary: false,
      },
    ],
  },
];

const coachAccountListItems = [
  {
    __typename: 'OrganizationAccountListCoaches' as const,
    id: 'd10e6360',
    coachFirstName: 'coachFirstName1',
    coachLastName: 'coachLastName1',
    coachEmailAddresses: [
      {
        id: 'a998a6d7',
        email: 'coach1@cru.org',
        primary: true,
      },
    ],
  },
];

describe('AccountLists Coaches or Users', () => {
  const handleDelete = jest.fn().mockResolvedValue(true);
  beforeEach(() => {
    handleDelete.mockClear();
  });

  it('should show user details', () => {
    const { getByText, getByTestId } = render(
      <Components>
        <GqlMockedProvider>
          <AccountListCoachesOrUsers
            accountListItems={userAccountListItems}
            setRemoveUser={handleDelete}
            setRemoveCoach={handleDelete}
            setDeleteUser={handleDelete}
          />
        </GqlMockedProvider>
      </Components>,
    );
    expect(getByText('userFirstName1 userLastName1')).toBeInTheDocument();
    expect(getByText('userFirstName2 userLastName2')).toBeInTheDocument();
    expect(getByText('userEmail1@cru.org')).toBeInTheDocument();
    expect(getByTestId('ContactAddressPrimaryText')).toBeInTheDocument();
    expect(getByText('userEmail2@cru.org')).toBeInTheDocument();
  });

  it('should show user Info buttons, tooltips and delete button', async () => {
    const { getByText, getByTestId, getAllByRole } = render(
      <Components>
        <GqlMockedProvider>
          <AccountListCoachesOrUsers
            accountListItems={[userAccountListItems[0]]}
            setRemoveUser={handleDelete}
            setRemoveCoach={handleDelete}
            setDeleteUser={handleDelete}
          />
        </GqlMockedProvider>
      </Components>,
    );

    userEvent.hover(getByTestId('InformationButton'));
    await waitFor(() => {
      expect(
        getByText(
          'User has been granted access to this account list by donation services. Last synced:',
        ),
      ).toBeVisible();
    });

    userEvent.hover(getByTestId('DeleteForeverIcon'));
    await waitFor(() => {
      expect(getByText('Permanently delete this user.')).toBeVisible();
    });

    userEvent.click(
      getAllByRole('button', {
        name: 'Delete',
      })[0],
    );
    expect(handleDelete).toHaveBeenCalled();
  });

  it('should not show delete button if the user is in more than 1 organization', async () => {
    const { queryByTestId } = render(
      <Components>
        <GqlMockedProvider>
          <AccountListCoachesOrUsers
            accountListItems={[userAccountListItems[1]]}
            setRemoveUser={handleDelete}
            setRemoveCoach={handleDelete}
            setDeleteUser={handleDelete}
          />
        </GqlMockedProvider>
      </Components>,
    );

    expect(queryByTestId('DeleteForeverIcon')).not.toBeInTheDocument();
  });

  it('should show coach remove buttons, tooltip and handleDelete()', async () => {
    const { getByText, getByTestId, getAllByRole } = render(
      <Components>
        <GqlMockedProvider>
          <AccountListCoachesOrUsers
            accountListItems={coachAccountListItems}
            setRemoveUser={handleDelete}
            setRemoveCoach={handleDelete}
            setDeleteUser={handleDelete}
          />
        </GqlMockedProvider>
      </Components>,
    );
    expect(getByText('coachFirstName1 coachLastName1')).toBeInTheDocument();
    expect(getByText('coach1@cru.org')).toBeInTheDocument();
    expect(getByTestId('CheckIcon')).toBeInTheDocument();

    userEvent.hover(getByTestId('RemoveCoachButton'));
    await waitFor(() => {
      expect(getByText('Remove this coach from the account.')).toBeVisible();
    });

    userEvent.click(
      getAllByRole('button', {
        name: 'Remove Coach',
      })[0],
    );
    expect(handleDelete).toHaveBeenCalled();
  });

  it('should show user remove buttons, tooltip and handleDelete()', async () => {
    const { getByText, getByTestId, getAllByRole } = render(
      <Components>
        <GqlMockedProvider>
          <AccountListCoachesOrUsers
            accountListItems={[userAccountListItems[0]]}
            setRemoveUser={handleDelete}
            setRemoveCoach={handleDelete}
            setDeleteUser={handleDelete}
          />
        </GqlMockedProvider>
      </Components>,
    );

    userEvent.hover(getByTestId('RemoveUserButton'));
    await waitFor(() => {
      expect(getByText('Remove this user from the account.')).toBeVisible();
    });

    userEvent.click(
      getAllByRole('button', {
        name: 'Remove User',
      })[0],
    );
    expect(handleDelete).toHaveBeenCalled();
  });
});
