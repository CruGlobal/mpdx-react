import { render, waitFor } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';
import theme from '../../../../theme';
import { IntegrationsContextProvider } from 'pages/accountLists/[accountListId]/settings/integrations.page';
import { ChalklineAccordian } from './ChalklineAccordian';

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

describe('PrayerlettersAccount', () => {
  process.env.OAUTH_URL = 'https://auth.mpdx.org';
  it('should render accordian closed', async () => {
    const { getByText, queryByRole } = render(
      Components(
        <GqlMockedProvider>
          <ChalklineAccordian
            handleAccordionChange={handleAccordionChange}
            expandedPanel={''}
          />
        </GqlMockedProvider>,
      ),
    );
    expect(getByText('Chalk Line')).toBeInTheDocument();
    const image = queryByRole('img', {
      name: /Chalk Line/i,
    });
    expect(image).not.toBeInTheDocument();
  });
  it('should render accordian open', async () => {
    const { queryByRole } = render(
      Components(
        <GqlMockedProvider>
          <ChalklineAccordian
            handleAccordionChange={handleAccordionChange}
            expandedPanel={'Chalk Line'}
          />
        </GqlMockedProvider>,
      ),
    );
    const image = queryByRole('img', {
      name: /Chalk Line/i,
    });
    expect(image).toBeInTheDocument();
  });

  it('should send contacts to Chalkline', async () => {
    const mutationSpy = jest.fn();
    const { getByText } = render(
      Components(
        <GqlMockedProvider onCall={mutationSpy}>
          <ChalklineAccordian
            handleAccordionChange={handleAccordionChange}
            expandedPanel={'Chalk Line'}
          />
        </GqlMockedProvider>,
      ),
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
