import { render, waitFor } from '@testing-library/react';
// import { getSession } from 'next-auth/react';
import { SnackbarProvider } from 'notistack';
// import * as nextRouter from 'next/router';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';
import theme from '../../../../theme';
import { ThemeProvider } from '@mui/material/styles';
import { IntegrationsContextProvider } from 'pages/accountLists/[accountListId]/settings/integrations.page';
import { MailchimpAccordian } from './MailchimpAccordian';
import {
  // useGetMailchimpAccountQuery,
  // useUpdateMailchimpAccountMutation,
  // GetMailchimpAccountDocument,
  GetMailchimpAccountQuery,
  // useSyncMailchimpAccountMutation,
  // useDeleteMailchimpAccountMutation,
} from './MailchimpAccount.generated';

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
// const expandedPanel = 'MailChimp';

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

describe('MailchimpAccount', () => {
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

  it('should render Mailchimp Overview', async () => {
    const mutationSpy = jest.fn();
    const { getByText } = render(
      Components(
        <GqlMockedProvider<{
          GetMailchimpAccount: GetMailchimpAccountQuery | undefined;
        }>
          mocks={{
            GetMailchimpAccount: {
              getMailchimpAccount: [],
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
  });
});
