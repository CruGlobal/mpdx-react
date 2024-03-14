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
import { DonationTable, DonationTableProps } from './DonationTable';
import {
  AccountListCurrencyQuery,
  DonationTableQuery,
} from './DonationTable.generated';

const onSelectContact = jest.fn();
const mutationSpy = jest.fn();

const router = {
  query: { accountListId: 'account-list-1' },
  isReady: true,
};

interface TestComponentProps {
  isEmpty?: boolean;
  hasForeignCurrency?: boolean;
  hasMultiplePages?: boolean;
  tableProps?: Partial<DonationTableProps>;
}

const TestComponent: React.FC<TestComponentProps> = ({
  isEmpty = false,
  hasForeignCurrency = false,
  hasMultiplePages = false,
  tableProps,
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
                currency: 'CAD',
                donations: {
                  nodes: isEmpty
                    ? []
                    : [
                        {
                          id: 'donation-1',
                          amount: {
                            amount: 10,
                            convertedAmount: 10,
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
                          },
                          paymentMethod: 'Check',
                        },
                        {
                          id: 'donation-2',
                          amount: {
                            amount: hasForeignCurrency ? 200 : 100,
                            convertedAmount: 100,
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
                          },
                          paymentMethod: 'Credit Card',
                        },
                      ],
                  pageInfo: {
                    endCursor: 'cursor',
                    hasNextPage: hasMultiplePages,
                  },
                },
              },
            }}
            onCall={mutationSpy}
          >
            <DonationTable
              accountListId={'abc'}
              onSelectContact={onSelectContact}
              filter={{
                designationAccountIds: ['designation-1'],
              }}
              visibleColumnsStorageKey=""
              emptyPlaceholder={<span>Empty Table</span>}
              {...tableProps}
            />
          </GqlMockedProvider>
        </TestRouter>
      </ThemeProvider>
    </LocalizationProvider>
  </SnackbarProvider>
);

describe('DonationTable', () => {
  it('renders with data', async () => {
    const { getByRole, findByRole } = render(<TestComponent />);

    expect(await findByRole('cell', { name: 'Donor 1' })).toBeInTheDocument();
    expect(getByRole('cell', { name: 'Donor 2' })).toBeInTheDocument();
    expect(getByRole('cell', { name: 'CA$10' })).toBeInTheDocument();
    expect(getByRole('cell', { name: 'CA$100' })).toBeInTheDocument();
    expect(getByRole('cell', { name: '3/1/2023' })).toBeInTheDocument();
    expect(getByRole('cell', { name: '3/2/2023' })).toBeInTheDocument();
    expect(getByRole('cell', { name: 'Check' })).toBeInTheDocument();
    expect(getByRole('cell', { name: 'Credit Card' })).toBeInTheDocument();
    expect(getByRole('cell', { name: 'Appeal 1' })).toBeInTheDocument();
  });

  it('opens and closes the edit donation modal', async () => {
    const { findByRole, findByText, queryByText, getByTestId, getByRole } =
      render(<TestComponent />);

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('DonationTable', {
        designationAccountIds: ['designation-1'],
      }),
    );

    expect(await findByRole('cell', { name: 'Donor 1' })).toBeInTheDocument();
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

  it('is clickable', async () => {
    const { findByText } = render(<TestComponent />);

    const link = await findByText('Donor 1');
    expect(link).toHaveClass('MuiLink-root');
    userEvent.click(link);
    expect(onSelectContact).toHaveBeenCalledWith('contact-1');
  });

  it('is not clickable', async () => {
    const { findByText } = render(<TestComponent />);

    userEvent.click(await findByText('Donor 1'));
    expect(onSelectContact).toHaveBeenCalledWith('contact-1');
  });

  it('is not a link when onSelectContact is not provided', async () => {
    const { findByText } = render(
      <TestComponent tableProps={{ onSelectContact: undefined }} />,
    );

    expect(await findByText('Donor 1')).not.toHaveClass('MuiLink-root');
    expect(onSelectContact).not.toHaveBeenCalled();
  });

  it('hides currency column when all currencies match the account currency', async () => {
    const { queryByRole, findByRole } = render(<TestComponent />);

    expect(await findByRole('cell', { name: 'Donor 1' })).toBeInTheDocument();
    expect(
      queryByRole('columnheader', { name: 'Foreign Amount' }),
    ).not.toBeInTheDocument();

    const totalRow = within(
      await findByRole('table', { name: 'Donation Totals' }),
    ).getByRole('row');
    expect(totalRow.children[0]).toHaveTextContent('Total Donations:');
    expect(totalRow.children[1]).toHaveTextContent('CA$110');
  });

  it('shows currency column and additional total rows when a currency does not match the account currency', async () => {
    const { findByRole } = render(<TestComponent hasForeignCurrency />);

    expect(
      await findByRole('columnheader', { name: 'Foreign Amount' }),
    ).toBeInTheDocument();

    const totalsRows = within(
      await findByRole('table', { name: 'Donation Totals' }),
    ).getAllByRole('row');
    expect(totalsRows).toHaveLength(4);
    expect(totalsRows[1].children[0]).toHaveTextContent('Total CAD Donations:');
    expect(totalsRows[1].children[1]).toHaveTextContent('CA$10');
    expect(totalsRows[1].children[2]).toHaveTextContent('CA$10');
    expect(totalsRows[2].children[0]).toHaveTextContent('Total USD Donations:');
    expect(totalsRows[2].children[1]).toHaveTextContent('CA$100');
    expect(totalsRows[2].children[2]).toHaveTextContent('$200');
    expect(totalsRows[3].children[0]).toHaveTextContent('Total Donations:');
    expect(totalsRows[3].children[1]).toHaveTextContent('CA$110');
  });

  it('updates the sort order', async () => {
    const { findByRole, getAllByRole } = render(<TestComponent />);

    const dateHeader = await findByRole('columnheader', { name: 'Date' });
    expect(
      within(dateHeader).getByTestId('ArrowDownwardIcon'),
    ).toBeInTheDocument();

    userEvent.click(await findByRole('columnheader', { name: 'Amount' }));
    const cellsAsc = getAllByRole('cell', { name: /CA/ });
    expect(cellsAsc[0]).toHaveTextContent('CA$10');
    expect(cellsAsc[1]).toHaveTextContent('CA$100');

    userEvent.click(await findByRole('columnheader', { name: 'Amount' }));
    const cellsDesc = getAllByRole('cell', { name: /CA/ });
    expect(cellsDesc[0]).toHaveTextContent('CA$100');
    expect(cellsDesc[1]).toHaveTextContent('CA$10');
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
});
