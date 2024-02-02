import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import {
  render,
  waitFor,
  within,
} from '__tests__/util/testingLibraryReactMock';
import theme from 'src/theme';
import { ContactDonationsList } from './ContactDonationsList';
import { ContactDonationsListQuery } from './ContactDonationsList.generated';

const accountListId = 'account-list-1';
const contactId = 'contact-id-1';

const router = {
  query: { accountListId },
  isReady: true,
};

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <TestRouter router={router}>
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <GqlMockedProvider<{ ContactDonationsList: ContactDonationsListQuery }>
          mocks={{
            ContactDonationsList: {
              contact: {
                id: contactId,
                donations: {
                  nodes: [...Array(5)].map(() => ({
                    amount: {
                      currency: 'USD',
                      convertedCurrency: 'EUR',
                      amount: 10,
                      convertedAmount: 9.9,
                    },
                  })),
                  pageInfo: {
                    hasNextPage: true,
                  },
                },
              },
            },
          }}
        >
          <SnackbarProvider>
            <ContactDonationsList
              accountListId={accountListId}
              contactId={contactId}
            />
          </SnackbarProvider>
        </GqlMockedProvider>
      </LocalizationProvider>
    </TestRouter>
  </ThemeProvider>
);

describe('ContactDonationsList', () => {
  it('renders donations', async () => {
    const { findAllByRole } = render(<TestComponent />);

    const rows = await findAllByRole('row');
    expect(rows).toHaveLength(6);

    const donationRow = rows[1];
    expect(donationRow.children[1]).toHaveTextContent('$10');
    expect(donationRow.children[2]).toHaveTextContent('€9.90');
  });

  it('loads more donations', async () => {
    const { findByRole, getAllByRole } = render(<TestComponent />);

    userEvent.click(await findByRole('button', { name: 'Load More' }));
    await waitFor(() => expect(getAllByRole('row')).toHaveLength(11));
  });

  it('edits donations', async () => {
    const { findAllByRole, getByText } = render(<TestComponent />);

    const rows = await findAllByRole('row');
    expect(rows).toHaveLength(6);

    const donationRow = rows[1];
    userEvent.click(within(donationRow).getByRole('button'));
    expect(getByText('Edit Donation')).toBeInTheDocument();
  });
});
