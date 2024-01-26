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
import { GetAccountListCurrencyQuery } from 'src/components/Reports/DonationsReport/GetDonationsTable.generated';
import theme from 'src/theme';
import { ContactDonationsList } from './ContactDonationsList';
import { ContactDonationsListQuery } from './ContactDonationsList.generated';

const accountListId = 'account-list-1';
const contactId = 'contact-id-1';

const router = {
  query: { accountListId },
  isReady: true,
};

interface TestComponentProps {
  foreignCurrencies?: boolean;
}

const TestComponent: React.FC<TestComponentProps> = ({
  foreignCurrencies = true,
}) => (
  <ThemeProvider theme={theme}>
    <TestRouter router={router}>
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <GqlMockedProvider<{
          ContactDonationsList: ContactDonationsListQuery;
          GetAccountListCurrency: GetAccountListCurrencyQuery;
        }>
          mocks={{
            ContactDonationsList: {
              contact: {
                id: contactId,
                donations: {
                  nodes: [...Array(5)].map(() => ({
                    amount: {
                      currency: foreignCurrencies ? 'EUR' : 'USD',
                      convertedCurrency: 'USD',
                      amount: 10,
                      convertedAmount: 9.9,
                    },
                    appeal: {
                      name: 'EOY Ask',
                    },
                  })),
                  pageInfo: {
                    hasNextPage: true,
                  },
                },
              },
            },
            GetAccountListCurrency: {
              accountList: {
                currency: 'USD',
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
    const { findAllByRole, getByRole } = render(<TestComponent />);

    const rows = await findAllByRole('row');
    expect(rows).toHaveLength(6);
    expect(
      getByRole('columnheader', { name: 'Converted Amount' }),
    ).toBeInTheDocument();

    const donationRow = rows[1];
    expect(donationRow.children[1]).toHaveTextContent('€10');
    expect(donationRow.children[2]).toHaveTextContent('$9.90');
    expect(
      within(donationRow).getByRole('cell', { name: 'EOY Ask' }),
    ).toBeInTheDocument();
  });

  it('hides converted currency column when it is redundant', async () => {
    const { queryByRole, findAllByRole } = render(
      <TestComponent foreignCurrencies={false} />,
    );

    const rows = await findAllByRole('row');
    expect(rows).toHaveLength(6);

    expect(
      queryByRole('columnheader', { name: 'Converted Amount' }),
    ).not.toBeInTheDocument();

    const donationRow = rows[1];
    expect(donationRow.children).toHaveLength(5);
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
