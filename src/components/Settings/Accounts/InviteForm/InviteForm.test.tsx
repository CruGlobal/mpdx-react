import { PropsWithChildren } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { InviteTypeEnum } from 'src/graphql/types.generated';
import theme from '../../../../theme';
import { InviteForm } from './InviteForm';

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

describe('InviteForm', () => {
  it('should invite a user', async () => {
    const mutationSpy = jest.fn();
    const {
      getByText,
      getByTestId,
      getByRole,
      queryByText,
      findByRole,
      queryByTestId,
    } = render(
      <Components>
        <GqlMockedProvider onCall={mutationSpy}>
          <InviteForm type={InviteTypeEnum.User} />
        </GqlMockedProvider>
      </Components>,
    );

    expect(
      getByText('Invite someone to share this account'),
    ).toBeInTheDocument();
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
      expect(
        getByText(
          'If you are trying to share coaching access please click No below and try again through the Manage Coaches page in Settings.',
        ),
      ).toBeInTheDocument();
    });
    userEvent.click(getByText('Yes'));

    await waitFor(() => {
      const createInviteCall = mutationSpy.mock.calls[0][0];
      expect(createInviteCall.operation.operationName).toEqual(
        'CreateAccountListInvite',
      );
      expect(createInviteCall.operation.variables.input.attributes).toEqual({
        accountListId: 'account-list-1',
        inviteUserAs: InviteTypeEnum.User,
        recipientEmail: 'test@test.org',
      });
    });

    expect(mockEnqueue).toHaveBeenCalledWith(
      '{{appName}} sent an invite to {{email}}',
      {
        variant: 'success',
      },
    );
    expect(await findByRole('textbox')).toHaveValue('');
  });

  it('should invite a coach', async () => {
    const mutationSpy = jest.fn();
    const { getByText, getByTestId, getByRole, findByRole, queryByText } =
      render(
        <Components>
          <GqlMockedProvider onCall={mutationSpy}>
            <InviteForm type={InviteTypeEnum.Coach} />
          </GqlMockedProvider>
        </Components>,
      );

    expect(
      getByText('Invite someone to share this account'),
    ).toBeInTheDocument();

    userEvent.type(getByRole('textbox'), 'test@test.org');
    userEvent.click(getByTestId('action-button'));

    await waitFor(() => {
      expect(getByText('Confirm')).toBeInTheDocument();
      expect(
        queryByText(
          'If you are trying to share coaching access please click No below and try again through the Manage Coaches page in Settings.',
        ),
      ).not.toBeInTheDocument();
    });
    userEvent.click(getByText('Yes'));

    await waitFor(() => {
      const createInviteCall = mutationSpy.mock.calls[0][0];
      expect(createInviteCall.operation.operationName).toEqual(
        'CreateAccountListInvite',
      );
      expect(createInviteCall.operation.variables.input.attributes).toEqual({
        accountListId: 'account-list-1',
        inviteUserAs: InviteTypeEnum.Coach,
        recipientEmail: 'test@test.org',
      });
    });

    expect(mockEnqueue).toHaveBeenCalledWith(
      '{{appName}} sent an invite to {{email}}',
      {
        variant: 'success',
      },
    );
    expect(await findByRole('textbox')).toHaveValue('');
  });
});
