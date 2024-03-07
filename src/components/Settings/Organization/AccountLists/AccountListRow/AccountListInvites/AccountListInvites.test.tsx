import { PropsWithChildren } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '../../../../../../../__tests__/util/graphqlMocking';
import theme from '../../../../../../theme';
import { AccountListsMocks } from '../../AccountLists.mock';
import { AccountListInvites } from './AccountListInvites';

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
  it('should show user details', async () => {
    const mutationSpy = jest.fn();
    const { getByText, getByTestId } = render(
      <Components>
        <GqlMockedProvider onCall={mutationSpy}>
          <AccountListInvites
            name={'accountName'}
            accountListInvites={accountList.accountListCoachInvites || []}
            accountListId={'accountListId'}
          />
        </GqlMockedProvider>
      </Components>,
    );
    expect(getByText('inviteCoach@cru.org')).toBeInTheDocument();
    expect(
      getByText('Invited by inviteCoachFirstName inviteCoachLastName'),
    ).toBeInTheDocument();

    expect(getByTestId('PersonRemoveIcon')).toBeInTheDocument();
    userEvent.click(getByTestId('PersonRemoveIcon'));

    await waitFor(() => {
      expect(
        getByText(
          'Are you sure you want to remove the invite for inviteCoach@cru.org from accountName?',
        ),
      ).toBeInTheDocument();
      userEvent.click(getByText('Yes'));
    });

    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith('Successfully deleted user', {
        variant: 'success',
      });
    });

    expect(mutationSpy.mock.calls[0][0].operation.operationName).toEqual(
      'AdminDeleteOrganizationInvite',
    );
    expect(mutationSpy.mock.calls[0][0].operation.variables.input).toEqual({
      accountListId: 'accountListId',
      inviteId: '3104a0fb',
    });
  });
});
