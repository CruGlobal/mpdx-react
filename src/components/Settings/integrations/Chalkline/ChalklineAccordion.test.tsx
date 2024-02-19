import { PropsWithChildren } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';
import theme from '../../../../theme';
import { ChalklineAccordion } from './ChalklineAccordion';

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

const handleAccordionChange = jest.fn();

const Components = ({ children }: PropsWithChildren) => (
  <SnackbarProvider>
    <TestRouter router={router}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
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
    const openMock = jest.fn();
    window.open = openMock;
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

    await waitFor(
      () =>
        expect(openMock).toHaveBeenCalledWith(
          'https://chalkline.org/order_mpdx/',
          '_blank',
        ),
      { timeout: 3000 },
    );
  });
});
