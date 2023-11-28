import { render, waitFor, PropsWithChildren } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../../../../theme';
import { GqlMockedProvider } from '../../../../../../__tests__/util/graphqlMocking';
import { IntegrationsContextProvider } from 'pages/accountLists/[accountListId]/settings/integrations/IntegrationsContext';
import TestRouter from '__tests__/util/TestRouter';
import { OrganizationEditAccountModal } from './OrganizationEditAccountModal';

jest.mock('next-auth/react');

const accountListId = 'account-list-1';
const organizationId = 'organization-1';
const contactId = 'contact-1';
const apiToken = 'apiToken';
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
      <ThemeProvider theme={theme}>
        <IntegrationsContextProvider apiToken={apiToken}>
          {children}
        </IntegrationsContextProvider>
      </ThemeProvider>
    </TestRouter>
  </SnackbarProvider>
);

const handleClose = jest.fn();

describe('OrganizationEditAccountModal', () => {
  process.env.OAUTH_URL = 'https://auth.mpdx.org';

  beforeEach(() => {
    handleClose.mockClear();
  });
  it('should render modal', async () => {
    const { getByText, getByTestId } = render(
      <Components>
        <GqlMockedProvider>
          <OrganizationEditAccountModal
            handleClose={handleClose}
            organizationId={organizationId}
          />
        </GqlMockedProvider>
      </Components>,
    );

    expect(getByText('Edit Organization Account')).toBeInTheDocument();

    userEvent.click(getByText(/cancel/i));
    expect(handleClose).toHaveBeenCalledTimes(1);
    userEvent.click(getByTestId('CloseIcon'));
    expect(handleClose).toHaveBeenCalledTimes(2);
  });

  it('should enter login details.', async () => {
    const mutationSpy = jest.fn();
    const { getByText, getByRole, getByTestId } = render(
      <Components>
        <GqlMockedProvider onCall={mutationSpy}>
          <OrganizationEditAccountModal
            handleClose={handleClose}
            organizationId={organizationId}
          />
        </GqlMockedProvider>
      </Components>,
    );

    await waitFor(() => {
      expect(getByText('Username')).toBeInTheDocument();
      expect(getByText('Password')).toBeInTheDocument();
    });

    userEvent.type(
      getByRole('textbox', {
        name: /username/i,
      }),
      'MyUsername',
    );
    await waitFor(() => expect(getByText('Save')).toBeDisabled());
    userEvent.type(getByTestId('passwordInput'), 'MyPassword');

    await waitFor(() => expect(getByText('Save')).not.toBeDisabled());
    userEvent.click(getByText('Save'));

    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith(
        '{{appName}} updated your organization account',
        { variant: 'success' },
      );
      expect(mutationSpy.mock.calls[0][0].operation.operationName).toEqual(
        'UpdateOrganizationAccount',
      );
      expect(mutationSpy.mock.calls[0][0].operation.variables.input).toEqual({
        attributes: {
          id: organizationId,
          username: 'MyUsername',
          password: 'MyPassword',
        },
      });
    });
  });
});
