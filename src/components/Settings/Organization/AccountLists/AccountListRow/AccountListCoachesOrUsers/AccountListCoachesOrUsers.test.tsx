import { PropsWithChildren } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '../../../../../../../__tests__/util/graphqlMocking';
import theme from '../../../../../../theme';
import {
  AccountListCoachesOrUsers,
  AccountListItemType,
} from './AccountListCoachesOrUsers';

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

describe('AccountLists', () => {
  const handleDelete = jest.fn().mockResolvedValue(true);
  beforeEach(() => {
    handleDelete.mockClear();
  });

  it('should show user details', () => {
    const { getByText, getByTestId } = render(
      <Components>
        <GqlMockedProvider>
          <AccountListCoachesOrUsers
            name={'accountName'}
            accountListItems={userAccountListItems}
            type={AccountListItemType.USER}
            handleDelete={handleDelete}
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

  it('should show user Info buttons', async () => {
    const { getByText, getByTestId, queryByTestId } = render(
      <Components>
        <GqlMockedProvider>
          <AccountListCoachesOrUsers
            name={'accountName'}
            accountListItems={[userAccountListItems[0]]}
            type={AccountListItemType.USER}
            handleDelete={handleDelete}
          />
        </GqlMockedProvider>
      </Components>,
    );

    expect(queryByTestId('DeleteIcon')).not.toBeInTheDocument();
    userEvent.hover(getByTestId('InformationButton'));
    await waitFor(() => {
      expect(
        getByText(
          'User has been granted access to this account list by donation services',
        ),
      ).toBeVisible();
    });
  });

  it('should show user delete buttons and handleDelete()', async () => {
    const { getByText, getByTestId } = render(
      <Components>
        <GqlMockedProvider>
          <AccountListCoachesOrUsers
            name={'accountName'}
            accountListItems={[userAccountListItems[1]]}
            type={AccountListItemType.USER}
            handleDelete={handleDelete}
          />
        </GqlMockedProvider>
      </Components>,
    );

    expect(getByTestId('DeleteIcon')).toBeInTheDocument();
    userEvent.click(getByTestId('DeleteIcon'));

    await waitFor(() => {
      expect(
        getByText(
          'Are you sure you want to remove {{user}} as a user from {{accountList}}?',
        ),
      ).toBeInTheDocument();
      userEvent.click(getByText('Yes'));
    });

    await waitFor(() => expect(handleDelete).toHaveBeenCalledTimes(1));
  });

  it('should show coach delete buttons and handleDelete()', async () => {
    const { getByText, getByTestId } = render(
      <Components>
        <GqlMockedProvider>
          <AccountListCoachesOrUsers
            name={'accountName'}
            accountListItems={coachAccountListItems}
            type={AccountListItemType.COACH}
            handleDelete={handleDelete}
          />
        </GqlMockedProvider>
      </Components>,
    );
    expect(getByText('coachFirstName1 coachLastName1')).toBeInTheDocument();
    expect(getByText('coach1@cru.org')).toBeInTheDocument();

    expect(getByTestId('DeleteIcon')).toBeInTheDocument();
    userEvent.click(getByTestId('DeleteIcon'));

    await waitFor(() => {
      expect(
        getByText(
          'Are you sure you want to remove {{coach}} as a coach from {{accountList}}?',
        ),
      ).toBeInTheDocument();
      userEvent.click(getByText('Yes'));
    });

    await waitFor(() => expect(handleDelete).toHaveBeenCalledTimes(1));
  });
});
