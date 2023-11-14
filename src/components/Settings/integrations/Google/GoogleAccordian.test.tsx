import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getSession } from 'next-auth/react';
import { ThemeProvider } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import theme from '../../../../theme';
import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';
import { IntegrationsContextProvider } from 'pages/accountLists/[accountListId]/settings/integrations/integrationsContext';
import { GoogleAccordian } from './GoogleAccordian';
import { GoogleAccountsQuery } from './googleAccounts.generated';

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

const handleAccordionChange = jest.fn();

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

describe('GoogleAccordian', () => {
  process.env.OAUTH_URL = 'https://auth.mpdx.org';
  (getSession as jest.Mock).mockResolvedValue(session);

  it('should render accordian closed', async () => {
    const { getByText, queryByRole } = render(
      Components(
        <GqlMockedProvider>
          <GoogleAccordian
            handleAccordionChange={handleAccordionChange}
            expandedPanel={''}
          />
        </GqlMockedProvider>,
      ),
    );
    expect(getByText('Google')).toBeInTheDocument();
    const Image = queryByRole('img', {
      name: /google/i,
    });
    expect(Image).not.toBeInTheDocument();
  });
  it('should render accordian open', async () => {
    const { queryByRole } = render(
      Components(
        <GqlMockedProvider>
          <GoogleAccordian
            handleAccordionChange={handleAccordionChange}
            expandedPanel={'Google'}
          />
        </GqlMockedProvider>,
      ),
    );
    const Image = queryByRole('img', {
      name: /google/i,
    });
    expect(Image).toBeInTheDocument();
  });

  describe('Not Connected', () => {
    it('should render Mailchimp Overview', async () => {
      const mutationSpy = jest.fn();
      const { getByText } = render(
        Components(
          <GqlMockedProvider<{
            GoogleAccount: GoogleAccountsQuery;
          }>
            mocks={{
              GoogleAccounts: {
                getGoogleAccounts: [],
              },
            }}
            onCall={mutationSpy}
          >
            <GoogleAccordian
              handleAccordionChange={handleAccordionChange}
              expandedPanel={'Google'}
            />
          </GqlMockedProvider>,
        ),
      );

      await waitFor(() => {
        expect(getByText(/google integration overview/i)).toBeInTheDocument();
      });
      userEvent.click(getByText(/add account/i));

      expect(getByText(/add account/i)).toHaveAttribute(
        'href',
        `https://auth.mpdx.org/auth/user/google?account_list_id=account-list-1&redirect_to=http%3A%2F%2Flocalhost%2FaccountLists%2Faccount-list-1%2Fsettings%2Fintegrations%3FselectedTab%3DGoogle&access_token=apiToken`,
      );
    });
  });

  describe('Connected', () => {
    let googleAccount = { ...standardGoogleAccount };
    process.env.REWRITE_DOMAIN = 'stage.mpdx.org';

    beforeEach(() => {
      googleAccount = { ...standardGoogleAccount };
    });
    it('shows one connected account', async () => {
      const mutationSpy = jest.fn();
      const { queryByText, getByText, getByTestId } = render(
        Components(
          <GqlMockedProvider<{
            GoogleAccount: GoogleAccountsQuery;
          }>
            mocks={{
              GoogleAccounts: {
                getGoogleAccounts: [googleAccount],
              },
            }}
            onCall={mutationSpy}
          >
            <GoogleAccordian
              handleAccordionChange={handleAccordionChange}
              expandedPanel={'Google'}
            />
          </GqlMockedProvider>,
        ),
      );

      await waitFor(() => {
        expect(getByText(standardGoogleAccount.email)).toBeInTheDocument();
      });

      userEvent.click(getByText(/import contacts/i));
      expect(getByText(/import contacts/i)).toHaveAttribute(
        'href',
        `https://stage.mpdx.org/tools/import/google`,
      );

      userEvent.click(getByTestId('EditIcon'));
      await waitFor(() =>
        expect(getByText(/edit google integration/i)).toBeInTheDocument(),
      );
      userEvent.click(getByTestId('CloseIcon'));
      await waitFor(() =>
        expect(queryByText(/edit google integration/i)).not.toBeInTheDocument(),
      );

      userEvent.click(getByTestId('DeleteIcon'));
      await waitFor(() =>
        expect(
          getByText(/confirm to disconnect google account/i),
        ).toBeInTheDocument(),
      );
      userEvent.click(getByTestId('CloseIcon'));
      await waitFor(() =>
        expect(
          queryByText(/confirm to disconnect google account/i),
        ).not.toBeInTheDocument(),
      );
    });

    it('shows account with expired token', async () => {
      const mutationSpy = jest.fn();
      googleAccount.tokenExpired = true;
      const { getByText, getAllByText } = render(
        Components(
          <GqlMockedProvider<{
            GoogleAccount: GoogleAccountsQuery;
          }>
            mocks={{
              GoogleAccounts: {
                getGoogleAccounts: [googleAccount],
              },
            }}
            onCall={mutationSpy}
          >
            <GoogleAccordian
              handleAccordionChange={handleAccordionChange}
              expandedPanel={'Google'}
            />
          </GqlMockedProvider>,
        ),
      );

      await waitFor(() => {
        expect(getByText(standardGoogleAccount.email)).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(getByText(/click "refresh google account/i)).toBeInTheDocument();
        expect(getAllByText(/refresh google account/i)[1]).toHaveAttribute(
          'href',
          `https://auth.mpdx.org/auth/user/google?account_list_id=account-list-1&redirect_to=http%3A%2F%2Flocalhost%2FaccountLists%2Faccount-list-1%2Fsettings%2Fintegrations%3FselectedTab%3DGoogle&access_token=apiToken`,
        );
      });
    });
  });
});
