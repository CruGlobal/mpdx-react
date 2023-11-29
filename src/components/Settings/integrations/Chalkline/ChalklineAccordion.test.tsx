import { PropsWithChildren } from 'react';
import { render, waitFor } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';
import theme from '../../../../theme';
import { IntegrationsContextProvider } from 'pages/accountLists/[accountListId]/settings/integrations/IntegrationsContext';
import { ChalklineAccordion } from './ChalklineAccordion';

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

describe('PrayerlettersAccount', () => {
  process.env.OAUTH_URL = 'https://auth.mpdx.org';
  it('should render accordion closed', async () => {
    const { getByText, queryByRole } = render(
      <Components>
        <GqlMockedProvider>
          <ChalklineAccordion
            handleAccordionChange={handleAccordionChange}
            expandedPanel={''}
          />
        </GqlMockedProvider>
      </Components>,
    );
    expect(getByText('Chalk Line')).toBeInTheDocument();
    const image = queryByRole('img', {
      name: /Chalk Line/i,
    });
    expect(image).not.toBeInTheDocument();
  });
  it('should render accordion open', async () => {
    const { queryByRole } = render(
      <Components>
        <GqlMockedProvider>
          <ChalklineAccordion
            handleAccordionChange={handleAccordionChange}
            expandedPanel={'Chalk Line'}
          />
        </GqlMockedProvider>
      </Components>,
    );
    const image = queryByRole('img', {
      name: /Chalk Line/i,
    });
    expect(image).toBeInTheDocument();
  });

  it('should send contacts to Chalkline', async () => {
    const mutationSpy = jest.fn();
    const { getByText } = render(
      <Components>
        <GqlMockedProvider onCall={mutationSpy}>
          <ChalklineAccordion
            handleAccordionChange={handleAccordionChange}
            expandedPanel={'Chalk Line'}
          />
        </GqlMockedProvider>
      </Components>,
    );
    await waitFor(() => {
      expect(getByText('Chalkline Overview')).toBeInTheDocument();
    });
    userEvent.click(getByText('Send my current Contacts to Chalkline'));
    await waitFor(() => {
      expect(getByText('Confirm')).toBeInTheDocument();
    });
    userEvent.click(getByText('Yes'));

    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith(
        'Successfully Emailed Chalkine',
        {
          variant: 'success',
        },
      );
      expect(mutationSpy.mock.calls[0][0].operation.operationName).toEqual(
        'SendToChalkline',
      );
      expect(mutationSpy.mock.calls[0][0].operation.variables.input).toEqual({
        accountListId: accountListId,
      });
    });
  });
});
