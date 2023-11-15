import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getSession } from 'next-auth/react';
import { ThemeProvider } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { IntegrationsContextProvider } from 'pages/accountLists/[accountListId]/settings/integrations/IntegrationsContext';
import { GqlMockedProvider } from '../../../../../../__tests__/util/graphqlMocking';
import theme from '../../../../../theme';
import { DeleteGoogleAccountModal } from './DeleteGoogleAccountModal';

jest.mock('next-auth/react');

const accountListId = 'account-list-1';
const contactId = 'contact-1';
const apiToken = 'apiToken';
const router = {
  query: { accountListId, contactId: [contactId] },
  isReady: true,
};
const session = {
  expires: '2021-10-28T14:48:20.897Z',
  user: {
    email: 'Chair Library Bed',
    image: null,
    name: 'Dung Tapestry',
    token: 'superLongJwtString',
  },
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

const handleClose = jest.fn();

const Components = (children: React.ReactElement) => (
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

const standardGoogleAccount = {
  email: 'test-n-rest@cru.org',
  primary: false,
  remoteId: '111222333444',
  id: 'abcd1234',
  tokenExpired: false,
  __typename: 'GoogleAccountAttributes',
};

describe('DeleteGoogleAccountModal', () => {
  process.env.OAUTH_URL = 'https://auth.mpdx.org';
  (getSession as jest.Mock).mockResolvedValue(session);
  let googleAccount = { ...standardGoogleAccount };

  beforeEach(() => {
    googleAccount = { ...standardGoogleAccount };
    handleClose.mockClear();
  });

  it('should render modal', async () => {
    const { getByText, getByTestId } = render(
      Components(
        <GqlMockedProvider>
          <DeleteGoogleAccountModal
            account={googleAccount}
            handleClose={handleClose}
          />
        </GqlMockedProvider>,
      ),
    );
    expect(
      getByText(/confirm to disconnect google account/i),
    ).toBeInTheDocument();
    userEvent.click(getByText(/cancel/i));
    expect(handleClose).toHaveBeenCalledTimes(1);
    userEvent.click(getByTestId('CloseIcon'));
    expect(handleClose).toHaveBeenCalledTimes(2);
  });

  it('should run deleteGoogleAccount', async () => {
    const mutationSpy = jest.fn();
    const { getByText } = render(
      Components(
        <GqlMockedProvider onCall={mutationSpy}>
          <DeleteGoogleAccountModal
            account={googleAccount}
            handleClose={handleClose}
          />
        </GqlMockedProvider>,
      ),
    );
    expect(
      getByText(/confirm to disconnect google account/i),
    ).toBeInTheDocument();
    userEvent.click(getByText('Confirm'));

    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith(
        'MPDX removed your integration with Google.',
        {
          variant: 'success',
        },
      );
      expect(mutationSpy.mock.calls[0][0].operation.operationName).toEqual(
        'DeleteGoogleAccount',
      );
      expect(
        mutationSpy.mock.calls[0][0].operation.variables.input.accountId,
      ).toEqual(standardGoogleAccount.id);
    });
  });
});
