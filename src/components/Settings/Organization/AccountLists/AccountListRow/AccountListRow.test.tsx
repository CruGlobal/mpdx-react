import { PropsWithChildren } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '../../../../../../__tests__/util/graphqlMocking';
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

const Components = ({ children }: PropsWithChildren) => (
  <SnackbarProvider>
    <TestRouter router={router}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </TestRouter>
  </SnackbarProvider>
);

describe('AccountLists', () => {
  it('should show details', () => {
    const { getByText, queryByText } = render(
      <Components>
        <GqlMockedProvider>
          <AccountListRow accountList={accountList} />
        </GqlMockedProvider>
      </Components>,
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
      <Components>
        <GqlMockedProvider>
          <AccountListRow
            accountList={{
              ...accountList,
              accountListUsers: [],
              accountListCoaches: [],
              accountListUsersInvites: [],
              accountListCoachInvites: [],
            }}
          />
        </GqlMockedProvider>
      </Components>,
    );

    expect(getByText('No users')).toBeInTheDocument();
    expect(getByText('No coaches')).toBeInTheDocument();
  });

  it('should show invites', () => {
    const { getByText, queryByText } = render(
      <Components>
        <GqlMockedProvider>
          <AccountListRow
            accountList={{
              ...accountList,
              accountListUsers: [],
              accountListCoaches: [],
            }}
          />
        </GqlMockedProvider>
      </Components>,
    );

    expect(queryByText('No users')).not.toBeInTheDocument();
    expect(queryByText('No coaches')).not.toBeInTheDocument();
    expect(getByText('inviteUser@cru.org')).toBeInTheDocument();
    expect(getByText('inviteCoach@cru.org')).toBeInTheDocument();
  });
});
