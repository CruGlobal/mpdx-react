import { render, waitFor, within, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import { MailchimpAccountQuery } from './MailchimpAccount.generated';
import * as Types from '../../../../../graphql/types.generated';
import theme from '../../../../theme';
import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';
import { IntegrationsContextProvider } from 'pages/accountLists/[accountListId]/settings/integrations/IntegrationsContext';
import TestRouter from '__tests__/util/TestRouter';
import { MailchimpAccordian } from './MailchimpAccordian';

jest.mock('next-auth/react');

const accountListId = 'account-list-1';
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

const standardMailchimpAccount: Types.MailchimpAccount = {
  __typename: 'MailchimpAccount',
  id: '123456789',
  active: true,
  autoLogCampaigns: false,
  createdAt: 'DATETIME',
  listsAvailableForNewsletters: [
    {
      __typename: 'listsAvailableForNewsletters',
      id: '11111111',
      name: 'Newsletter list 1',
    },
    {
      __typename: 'listsAvailableForNewsletters',
      id: '2222222',
      name: 'Newsletter list 2',
    },
    {
      __typename: 'listsAvailableForNewsletters',
      id: '33333333',
      name: 'Newsletter list 3',
    },
  ],
  listsLink: 'https://listsLink.com',
  listsPresent: true,
  primaryListId: '11111111',
  primaryListName: 'primaryListName',
  updatedAt: 'DATETIME',
  updatedInDbAt: 'DATETIME',
  valid: false,
  validateKey: true,
  validationError: null,
};

describe('MailchimpAccount', () => {
  process.env.OAUTH_URL = 'https://auth.mpdx.org';
  it('should render accordian closed', async () => {
    const { getByText, queryByRole } = render(
      Components(
        <GqlMockedProvider>
          <MailchimpAccordian
            handleAccordionChange={handleAccordionChange}
            expandedPanel={''}
          />
        </GqlMockedProvider>,
      ),
    );
    expect(getByText('MailChimp')).toBeInTheDocument();
    const mailchimpImage = queryByRole('img', {
      name: /mailchimp/i,
    });
    expect(mailchimpImage).not.toBeInTheDocument();
  });
  it('should render accordian open', async () => {
    const { queryByRole } = render(
      Components(
        <GqlMockedProvider>
          <MailchimpAccordian
            handleAccordionChange={handleAccordionChange}
            expandedPanel={'Mailchimp'}
          />
        </GqlMockedProvider>,
      ),
    );
    const mailchimpImage = queryByRole('img', {
      name: /mailchimp/i,
    });
    expect(mailchimpImage).toBeInTheDocument();
  });

  describe('Not Connected', () => {
    it('should render Mailchimp Overview', async () => {
      const mutationSpy = jest.fn();
      const { getByText } = render(
        Components(
          <GqlMockedProvider<{
            MailchimpAccount: MailchimpAccountQuery | undefined;
          }>
            mocks={{
              MailchimpAccount: {
                mailchimpAccount: [],
              },
            }}
            onCall={mutationSpy}
          >
            <MailchimpAccordian
              handleAccordionChange={handleAccordionChange}
              expandedPanel={'Mailchimp'}
            />
          </GqlMockedProvider>,
        ),
      );

      await waitFor(() => {
        expect(getByText('MailChimp Overview')).toBeInTheDocument();
      });
      userEvent.click(getByText('Connect MailChimp'));

      expect(getByText('Connect MailChimp')).toHaveAttribute(
        'href',
        `https://auth.mpdx.org/auth/user/mailchimp?account_list_id=account-list-1&redirect_to=http%3A%2F%2Flocalhost%2FaccountLists%2Faccount-list-1%2Fsettings%2Fintegrations%3FselectedTab%3Dmailchimp&access_token=apiToken`,
      );
    });
  });

  describe('Connected', () => {
    let mailchimpAccount = { ...standardMailchimpAccount };

    beforeEach(() => {
      mailchimpAccount = { ...standardMailchimpAccount };
    });
    it('is connected but no lists present', async () => {
      mailchimpAccount.listsPresent = false;
      const mutationSpy = jest.fn();
      const { queryByText } = render(
        Components(
          <GqlMockedProvider<{
            MailchimpAccount: MailchimpAccountQuery | undefined;
          }>
            mocks={{
              MailchimpAccount: {
                mailchimpAccount: [mailchimpAccount],
              },
            }}
            onCall={mutationSpy}
          >
            <MailchimpAccordian
              handleAccordionChange={handleAccordionChange}
              expandedPanel={'Mailchimp'}
            />
          </GqlMockedProvider>,
        ),
      );

      await waitFor(() => {
        expect(
          queryByText('Please choose a list to sync with MailChimp.'),
        ).toBeInTheDocument();
        expect(
          queryByText(
            'You need to create a list on Mail Chimp that MPDX can use for your newsletter.',
          ),
        ).toBeInTheDocument();
        expect(
          queryByText('Go to MailChimp to create a list.'),
        ).toBeInTheDocument();
      });

      expect(
        queryByText('Pick a list to use for your newsletter'),
      ).not.toBeInTheDocument();
    });

    it('is connected but no lists present & no lists link', async () => {
      mailchimpAccount.listsPresent = false;
      mailchimpAccount.listsLink = '';
      const mutationSpy = jest.fn();
      const { queryByText } = render(
        Components(
          <GqlMockedProvider<{
            MailchimpAccount: MailchimpAccountQuery | undefined;
          }>
            mocks={{
              MailchimpAccount: {
                mailchimpAccount: [mailchimpAccount],
              },
            }}
            onCall={mutationSpy}
          >
            <MailchimpAccordian
              handleAccordionChange={handleAccordionChange}
              expandedPanel={'Mailchimp'}
            />
          </GqlMockedProvider>,
        ),
      );

      await waitFor(() => {
        expect(
          queryByText(
            'You need to create a list on Mail Chimp that MPDX can use for your newsletter.',
          ),
        ).toBeInTheDocument();
      });

      expect(
        queryByText('Go to MailChimp to create a list.'),
      ).not.toBeInTheDocument();
    });

    it('should call updateMailchimpAccount', async () => {
      const mutationSpy = jest.fn();
      const { getByText, getByRole } = render(
        Components(
          <GqlMockedProvider<{
            MailchimpAccount: MailchimpAccountQuery | undefined;
          }>
            mocks={{
              MailchimpAccount: {
                mailchimpAccount: [mailchimpAccount],
              },
            }}
            onCall={mutationSpy}
          >
            <MailchimpAccordian
              handleAccordionChange={handleAccordionChange}
              expandedPanel={'Mailchimp'}
            />
          </GqlMockedProvider>,
        ),
      );

      await waitFor(() => {
        expect(
          getByText('Pick a list to use for your newsletter'),
        ).toBeInTheDocument();
      });

      userEvent.click(getByRole('button', { name: /Newsletter list 1/i }));
      await waitFor(() =>
        expect(
          getByRole('option', { name: /Newsletter list 2/i }),
        ).toBeInTheDocument(),
      );
      userEvent.click(getByRole('option', { name: /Newsletter list 2/i }));

      userEvent.click(
        getByRole('checkbox', {
          name: /automatically log sent mailchimp campaigns in contact task history/i,
        }),
      );

      userEvent.click(
        getByRole('button', {
          name: /save/i,
        }),
      );

      await waitFor(() => {
        expect(mockEnqueue).toHaveBeenCalledWith(
          'Your MailChimp sync has been started. This process may take up to 4 hours to complete.',
          {
            variant: 'success',
          },
        );
      });

      expect(mutationSpy.mock.calls[1][0].operation.operationName).toEqual(
        'UpdateMailchimpAccount',
      );
      expect(mutationSpy.mock.calls[1][0].operation.variables.input).toEqual({
        accountListId: 'account-list-1',
        mailchimpAccount: { primaryListId: '2222222', autoLogCampaigns: true },
        mailchimpAccountId: '123456789',
      });
    });

    it('should call deleteMailchimpAccount', async () => {
      const mutationSpy = jest.fn();
      const { getByText, getByRole } = render(
        Components(
          <GqlMockedProvider<{
            MailchimpAccount: MailchimpAccountQuery | undefined;
          }>
            mocks={{
              MailchimpAccount: {
                mailchimpAccount: [mailchimpAccount],
              },
            }}
            onCall={mutationSpy}
          >
            <MailchimpAccordian
              handleAccordionChange={handleAccordionChange}
              expandedPanel={'Mailchimp'}
            />
          </GqlMockedProvider>,
        ),
      );

      await waitFor(() => {
        expect(
          getByText('Pick a list to use for your newsletter'),
        ).toBeInTheDocument();
      });

      userEvent.click(
        getByRole('button', {
          name: /disconnect/i,
        }),
      );

      await waitFor(() => {
        expect(
          getByText('Confirm to Disconnect Mailchimp Account'),
        ).toBeInTheDocument();
      });

      userEvent.click(
        getByRole('button', {
          name: /confirm/i,
        }),
      );

      await waitFor(() => {
        expect(mockEnqueue).toHaveBeenCalledWith(
          'MPDX removed your integration with MailChimp',
          {
            variant: 'success',
          },
        );
      });

      expect(mutationSpy.mock.calls[1][0].operation.operationName).toEqual(
        'DeleteMailchimpAccount',
      );
      expect(mutationSpy.mock.calls[1][0].operation.variables.input).toEqual({
        accountListId: 'account-list-1',
      });
      // refetch account
      expect(mutationSpy.mock.calls[2][0].operation.operationName).toEqual(
        'MailchimpAccount',
      );
    });
    it('should show settings overview', async () => {
      mailchimpAccount.valid = true;
      const mutationSpy = jest.fn();
      const { getByText } = render(
        Components(
          <GqlMockedProvider<{
            MailchimpAccount: MailchimpAccountQuery | undefined;
          }>
            mocks={{
              MailchimpAccount: {
                mailchimpAccount: [mailchimpAccount],
              },
            }}
            onCall={mutationSpy}
          >
            <MailchimpAccordian
              handleAccordionChange={handleAccordionChange}
              expandedPanel={'Mailchimp'}
            />
          </GqlMockedProvider>,
        ),
      );

      await waitFor(() => {
        expect(
          getByText(
            'Your contacts are now automatically syncing with MailChimp',
          ),
        ).toBeInTheDocument();
      });

      expect(getByText(/primaryListName/i)).toBeInTheDocument();
      expect(getByText(/off/i)).toBeInTheDocument();
    });

    it('should call syncMailchimpAccount', async () => {
      mailchimpAccount.valid = true;
      mailchimpAccount.autoLogCampaigns = true;
      const mutationSpy = jest.fn();
      const { getByText, getByRole } = render(
        Components(
          <GqlMockedProvider<{
            MailchimpAccount: MailchimpAccountQuery | undefined;
          }>
            mocks={{
              MailchimpAccount: {
                mailchimpAccount: [mailchimpAccount],
              },
            }}
            onCall={mutationSpy}
          >
            <MailchimpAccordian
              handleAccordionChange={handleAccordionChange}
              expandedPanel={'Mailchimp'}
            />
          </GqlMockedProvider>,
        ),
      );

      await waitFor(() => {
        expect(
          getByText(
            'Your contacts are now automatically syncing with MailChimp',
          ),
        ).toBeInTheDocument();
      });

      const list = getByRole('list');
      within(list).getByText(/on/i);

      userEvent.click(
        getByRole('button', {
          name: /sync now/i,
        }),
      );

      await waitFor(() => {
        expect(mockEnqueue).toHaveBeenCalledWith(
          'Your MailChimp sync has been started. This process may take up to 4 hours to complete.',
          {
            variant: 'success',
          },
        );
      });

      expect(mutationSpy.mock.calls[1][0].operation.operationName).toEqual(
        'SyncMailchimpAccount',
      );
      expect(mutationSpy.mock.calls[1][0].operation.variables.input).toEqual({
        accountListId: 'account-list-1',
      });
    });
    it('should show settings', async () => {
      mailchimpAccount.valid = true;
      mailchimpAccount.autoLogCampaigns = true;
      const mutationSpy = jest.fn();
      const { queryByText, getByRole } = render(
        Components(
          <GqlMockedProvider<{
            MailchimpAccount: MailchimpAccountQuery | undefined;
          }>
            mocks={{
              MailchimpAccount: {
                mailchimpAccount: [mailchimpAccount],
              },
            }}
            onCall={mutationSpy}
          >
            <MailchimpAccordian
              handleAccordionChange={handleAccordionChange}
              expandedPanel={'Mailchimp'}
            />
          </GqlMockedProvider>,
        ),
      );

      await waitFor(() => {
        expect(
          queryByText(
            'Your contacts are now automatically syncing with MailChimp',
          ),
        ).toBeInTheDocument();
      });

      await act(async () => {
        userEvent.click(
          getByRole('button', {
            name: /modify settings/i,
          }),
        );
      });

      await waitFor(() => {
        expect(
          queryByText(
            'Your contacts are now automatically syncing with MailChimp',
          ),
        ).not.toBeInTheDocument();
        expect(
          queryByText('Pick a list to use for your newsletter'),
        ).toBeInTheDocument();
      });
    });
  });
});
