import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { ContactPanelProvider } from '../common/ContactPanelProvider/ContactPanelProvider';
import { DonationTable, DonationTableProps } from './DonationTable';
import {
  AccountListCurrencyQuery,
  DonationTableQuery,
} from './DonationTable.generated';

const mutationSpy = jest.fn();

const router = {
  pathname: '/accountLists/[accountListId]/reports/donations/[[...contactId]]',
  query: { accountListId: 'account-list-1' },
  isReady: true,
};

interface TestComponentProps {
  isEmpty?: boolean;
  hasForeignCurrency?: boolean;
  hasMultiplePages?: boolean;
  tableProps?: Partial<DonationTableProps>;
  hideDisplayName?: boolean;
}

const TestComponent: React.FC<TestComponentProps> = ({
  isEmpty = false,
  hasForeignCurrency = false,
  hasMultiplePages = false,
  tableProps,
  hideDisplayName = false,
}) => (
  <SnackbarProvider>
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <ThemeProvider theme={theme}>
        <TestRouter router={router}>
          <GqlMockedProvider<{
            AccountListCurrency: AccountListCurrencyQuery;
            DonationTable: DonationTableQuery;
          }>
            mocks={{
              AccountListCurrency: {
                accountList: {
                  currency: 'CAD',
                },
              },
              DonationTable: {
                donations: {
                  nodes: isEmpty
                    ? []
                    : [
                        {
                          id: 'donation-1',
                          amount: {
                            amount: 11.55,
                            convertedAmount: 11.55,
                            convertedCurrency: 'CAD',
                            currency: 'CAD',
                          },
                          appeal: {
                            name: 'Appeal 1',
                          },
                          donationDate: '2023-03-01',
                          donorAccount: {
                            contacts: {
                              nodes: [{ id: 'contact-1' }],
                            },
                            displayName: 'Donor 1',
                            accountNumber: 'accountNumber-1',
                          },
                          paymentMethod: 'Check',
                          designationAccount: {
                            name: 'Tony Starks Account',
                            accountNumber: '111111',
                          },
                        },
                        {
                          id: 'donation-2',
                          amount: {
                            amount: hasForeignCurrency ? 200.55 : 100,
                            convertedAmount: hasForeignCurrency ? 100.89 : 100,
                            convertedCurrency: 'CAD',
                            currency: hasForeignCurrency ? 'USD' : 'CAD',
                          },
                          appeal: null,
                          donationDate: '2023-03-02',
                          donorAccount: {
                            contacts: {
                              nodes: [],
                            },
                            displayName: 'Donor 2',
                            accountNumber: 'accountNumber-2',
                          },
                          paymentMethod: 'Credit Card',
                          designationAccount: {
                            name: '',
                            accountNumber: '080808',
                          },
                        },
                      ],
                  totalCount: 2,
                  pageInfo: {
                    endCursor: 'cursor',
                    hasNextPage: hasMultiplePages,
                  },
                },
              },
            }}
            onCall={mutationSpy}
          >
            <ContactPanelProvider>
              <DonationTable
                accountListId={'abc'}
                filter={{
                  designationAccountIds: ['designation-1'],
                }}
                visibleColumnsStorageKey=""
                emptyPlaceholder={<span>Empty Table</span>}
                hideDisplayName={hideDisplayName}
                {...tableProps}
              />
            </ContactPanelProvider>
          </GqlMockedProvider>
        </TestRouter>
      </ThemeProvider>
    </LocalizationProvider>
  </SnackbarProvider>
);

describe('DonationTable', () => {
  it('renders with data', async () => {
    const { getByRole, findByRole } = render(<TestComponent />);

    expect(
      await findByRole('gridcell', { name: 'Donor 1' }),
    ).toBeInTheDocument();
    expect(getByRole('gridcell', { name: 'Donor 2' })).toBeInTheDocument();
    expect(getByRole('gridcell', { name: 'CA$11.55' })).toBeInTheDocument();
    expect(getByRole('gridcell', { name: 'CA$100' })).toBeInTheDocument();
    expect(getByRole('gridcell', { name: '3/1/2023' })).toBeInTheDocument();
    expect(getByRole('gridcell', { name: '3/2/2023' })).toBeInTheDocument();
    expect(getByRole('gridcell', { name: 'Check' })).toBeInTheDocument();
    expect(getByRole('gridcell', { name: 'Credit Card' })).toBeInTheDocument();
    expect(getByRole('gridcell', { name: 'Appeal 1' })).toBeInTheDocument();
  });

  it('renders the partner display name when not on contact page.', async () => {
    const { getByRole, findByRole } = render(<TestComponent />);

    expect(
      await findByRole('columnheader', { name: 'Partner' }),
    ).toBeInTheDocument();
    expect(getByRole('gridcell', { name: 'Donor 2' })).toBeInTheDocument();
  });

  it('renders the partner account number when on contact page', async () => {
    const { getByRole, findByRole } = render(
      <TestComponent hideDisplayName={true} />,
    );

    expect(
      await findByRole('columnheader', { name: 'Partner No.' }),
    ).toBeInTheDocument();
    expect(
      getByRole('gridcell', { name: 'accountNumber-2' }),
    ).toBeInTheDocument();
  });

  it('opens and closes the edit donation modal', async () => {
    const { findByRole, findByText, queryByText, getByTestId, getByRole } =
      render(<TestComponent />);

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('DonationTable', {
        designationAccountIds: ['designation-1'],
      }),
    );

    expect(
      await findByRole('gridcell', { name: 'Donor 1' }),
    ).toBeInTheDocument();
    expect(queryByText('Edit Donation')).not.toBeInTheDocument();

    userEvent.click(getByTestId('edit-donation-1'));
    expect(await findByText('Edit Donation')).toBeInTheDocument();

    userEvent.click(getByRole('button', { name: 'Cancel' }));
    expect(queryByText('Edit Donation')).not.toBeInTheDocument();
  });

  it('renders loading spinner when loading prop is true', async () => {
    const { findByTestId } = render(
      <TestComponent tableProps={{ loading: true }} />,
    );

    expect(await findByTestId('LoadingBox')).toBeInTheDocument();
    await waitFor(() =>
      expect(mutationSpy).not.toHaveGraphqlOperation('DonationTable'),
    );
  });

  it('renders empty', async () => {
    const { findByText } = render(<TestComponent isEmpty />);

    expect(await findByText('Empty Table')).toBeInTheDocument();
  });

  it('contact name is not a link when the contact has no donor account', async () => {
    const { findByText, queryByRole } = render(<TestComponent />);

    expect(await findByText('Donor 2')).toBeInTheDocument();
    expect(queryByRole('link', { name: 'Donor 2' })).not.toBeInTheDocument();
  });

  it('contact name is a link when the contact has a donor account', async () => {
    const { findByRole } = render(<TestComponent />);

    expect(await findByRole('link', { name: 'Donor 1' })).toHaveAttribute(
      'href',
      '/accountLists/account-list-1/reports/donations/contact-1',
    );
  });

  it('hides currency column when all currencies match the account currency', async () => {
    const { queryByRole, findByRole } = render(<TestComponent />);

    expect(
      await findByRole('gridcell', { name: 'Donor 1' }),
    ).toBeInTheDocument();
    expect(
      queryByRole('columnheader', { name: 'Foreign Amount' }),
    ).not.toBeInTheDocument();

    const totalRow = within(
      await findByRole('table', { name: 'Donation Totals' }),
    ).getByRole('row');
    expect(totalRow.children[0]).toHaveTextContent('Total Donations:');
    expect(totalRow.children[1]).toHaveTextContent('CA$111.55');
  });

  it('shows currency column and additional total rows when a currency does not match the account currency', async () => {
    const { findByRole, findAllByRole, getAllByRole } = render(
      <TestComponent hasForeignCurrency />,
    );

    expect(
      await findAllByRole('columnheader', { name: 'Foreign Amount' }),
    ).toHaveLength(2);
    expect(
      await findByRole('gridcell', { name: 'Donor 1' }),
    ).toBeInTheDocument();
    // Test that a donation with the same currency as the contact is not rounded
    // It should be found twice in the donation table
    expect(getAllByRole('gridcell', { name: 'CA$11.55' })).toHaveLength(2);
    // It should be found and twice in the totals table
    expect(getAllByRole('cell', { name: 'CA$11.55' })).toHaveLength(2);

    const totalsRows = within(
      await findByRole('table', { name: 'Donation Totals' }),
    ).getAllByRole('row');
    expect(totalsRows).toHaveLength(4);
    expect(totalsRows[1].children[0]).toHaveTextContent('Total CAD Donations:');
    expect(totalsRows[1].children[1]).toHaveTextContent('CA$11.55');
    expect(totalsRows[1].children[2]).toHaveTextContent('CA$11.55');
    expect(totalsRows[2].children[0]).toHaveTextContent('Total USD Donations:');
    expect(totalsRows[2].children[1]).toHaveTextContent('CA$101');
    expect(totalsRows[2].children[2]).toHaveTextContent('$200.55');
    expect(totalsRows[3].children[0]).toHaveTextContent('Total Donations:');
    expect(totalsRows[3].children[1]).toHaveTextContent('CA$112');
  });

  it('updates the sort order', async () => {
    const { findByRole, getAllByRole } = render(<TestComponent />);

    const dateHeader = await findByRole('columnheader', { name: 'Date' });
    expect(
      within(dateHeader).getByTestId('ArrowDownwardIcon'),
    ).toBeInTheDocument();

    userEvent.click(await findByRole('columnheader', { name: 'Amount' }));
    const cellsAsc = getAllByRole('gridcell', { name: /CA/ });
    expect(cellsAsc[0]).toHaveTextContent('CA$11.55');
    expect(cellsAsc[1]).toHaveTextContent('CA$100');

    userEvent.click(await findByRole('columnheader', { name: 'Amount' }));
    const cellsDesc = getAllByRole('gridcell', { name: /CA/ });
    expect(cellsDesc[0]).toHaveTextContent('CA$100');
    expect(cellsDesc[1]).toHaveTextContent('CA$11.55');
  });

  it('loads multiple pages and shows the progress bar', async () => {
    const { findByRole, queryByRole } = render(
      <TestComponent hasMultiplePages />,
    );

    expect(await findByRole('progressbar')).toBeInTheDocument();
    expect(
      queryByRole('table', { name: 'Donation Totals' }),
    ).not.toBeInTheDocument();

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('DonationTable', {
        designationAccountIds: ['designation-1'],
        after: 'cursor',
      }),
    );
  });

  it('updates the page size without reloading the donations', async () => {
    const { findByRole, getByRole } = render(<TestComponent />);

    userEvent.click(await findByRole('combobox', { name: 'Rows per page:' }));
    userEvent.click(getByRole('option', { name: '50' }));

    await waitFor(() =>
      expect(mutationSpy).not.toHaveGraphqlOperation('DonationTable', {
        pageSize: 50,
      }),
    );
  });

  it('shows designation number if there is no designation name', async () => {
    const { findByText } = render(<TestComponent />);

    expect(await findByText('Tony Starks Account')).toBeInTheDocument();
    expect(await findByText('080808')).toBeInTheDocument();
  });
});
