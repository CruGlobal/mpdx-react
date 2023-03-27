import React, { useState } from 'react';
import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { DateTime } from 'luxon';
import { cloneDeep } from 'lodash';
import theme from '../../../../theme';
import { GetDonationsTableQuery } from '../GetDonationsTable.generated';
import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';
import { DonationsReportTable } from './DonationsReportTable';
import TestRouter from '__tests__/util/TestRouter';
import { SnackbarProvider } from 'notistack';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';

const time = DateTime.now();
const setTime = jest.fn();
const onSelectContact = jest.fn();

const router = {
  query: { accountListId: 'aaa' },
  isReady: true,
};

const mocks = {
  GetAccountListCurrency: {
    accountList: {
      id: 'abc',
      currency: 'CAD',
    },
  },
  GetDonationsTable: {
    donations: {
      nodes: [
        {
          amount: {
            amount: 10,
            convertedAmount: 10,
            convertedCurrency: 'CAD',
            currency: 'CAD',
          },
          appeal: {
            id: 'abc',
            name: 'Appeal Test 1',
          },
          donationDate: '2023-03-01',
          donorAccount: {
            contacts: {
              nodes: [{ id: 'contact1' }],
            },
            displayName: 'John',
            id: 'abc',
          },
          id: 'abc',
          paymentMethod: 'pay',
        },
        {
          amount: {
            amount: 100,
            convertedAmount: 100,
            convertedCurrency: 'CAD',
            currency: 'CAD',
          },
          appeal: null,
          donationDate: DateTime.now().minus({ minutes: 5 }).toISO(),
          donorAccount: {
            contacts: {
              nodes: [{ id: 'contact2' }],
            },
            displayName: 'John',
            id: 'def',
          },
          id: 'def',
          paymentMethod: 'pay',
        },
      ],
      pageInfo: {
        hasNextPage: false,
      },
    },
  },
};

describe('DonationsReportTable', () => {
  it('renders with data', async () => {
    const {
      getAllByTestId,
      queryAllByRole,
      queryByRole,
      getByText,
      queryAllByText,
    } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<GetDonationsTableQuery> mocks={mocks}>
          <DonationsReportTable
            accountListId={'abc'}
            onSelectContact={onSelectContact}
            time={time}
            setTime={setTime}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    await waitFor(() =>
      expect(queryByRole('progressbar')).not.toBeInTheDocument(),
    );

    expect(queryAllByRole('button')[1]).toBeInTheDocument();

    expect(getAllByTestId('donationRow')[0]).toBeInTheDocument();

    await waitFor(() =>
      expect(queryAllByText('Appeal Test 1')).toHaveLength(1),
    );

    expect(getAllByTestId('appeal-name')).toHaveLength(2);

    expect(getAllByTestId('appeal-name')[1]).toHaveTextContent('');

    expect(getByText('3/1/2023')).toBeInTheDocument();
  });

  it('opens and closes the edit donation modal', async () => {
    const { queryByRole, queryByText, getByText, getByTestId, getByRole } =
      render(
        <SnackbarProvider>
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <ThemeProvider theme={theme}>
              <TestRouter router={router}>
                <GqlMockedProvider<GetDonationsTableQuery> mocks={mocks}>
                  <DonationsReportTable
                    accountListId={'abc'}
                    onSelectContact={onSelectContact}
                    time={time}
                    setTime={setTime}
                  />
                </GqlMockedProvider>
              </TestRouter>
            </ThemeProvider>
          </LocalizationProvider>
        </SnackbarProvider>,
      );

    await waitFor(() =>
      expect(queryByRole('progressbar')).not.toBeInTheDocument(),
    );

    expect(queryByText('Edit Donation')).not.toBeInTheDocument();

    await waitFor(() => expect(getByTestId('edit-abc')).toBeInTheDocument());

    userEvent.click(getByTestId('edit-abc'));

    expect(getByText('Edit Donation')).toBeInTheDocument();

    userEvent.click(getByRole('button', { name: 'Cancel' }));

    expect(queryByText('Edit Donation')).not.toBeInTheDocument();
  });

  it('renders empty', async () => {
    const mocks = {
      GetDonationsTable: {
        donations: {
          nodes: [],
          pageInfo: {
            hasNextPage: false,
          },
        },
      },
    };

    const { queryByTestId, queryAllByRole, queryByRole } = render(
      <ThemeProvider theme={theme}>
        <TestRouter router={router}>
          <GqlMockedProvider<GetDonationsTableQuery> mocks={mocks}>
            <DonationsReportTable
              accountListId={'abc'}
              onSelectContact={onSelectContact}
              time={time}
              setTime={setTime}
            />
          </GqlMockedProvider>
        </TestRouter>
      </ThemeProvider>,
    );

    await waitFor(() =>
      expect(queryByRole('progressbar')).not.toBeInTheDocument(),
    );

    expect(queryAllByRole('button')[1]).toBeInTheDocument();

    expect(queryByTestId('donationRow')).not.toBeInTheDocument();
  });

  it('is clickable', async () => {
    const { queryAllByText } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<GetDonationsTableQuery> mocks={mocks}>
          <DonationsReportTable
            accountListId={'abc'}
            onSelectContact={onSelectContact}
            time={time}
            setTime={setTime}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    await waitFor(() => expect(queryAllByText('John')).toHaveLength(2));

    userEvent.click(queryAllByText('John')[0]);
    expect(onSelectContact).toHaveBeenCalledWith('contact1');
  });

  it('filters report by designation account', async () => {
    const mutationSpy = jest.fn();
    render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<GetDonationsTableQuery>
          mocks={mocks}
          onCall={mutationSpy}
        >
          <DonationsReportTable
            accountListId={'abc'}
            designationAccounts={['account-1']}
            onSelectContact={onSelectContact}
            time={time}
            setTime={setTime}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    await waitFor(() =>
      expect(mutationSpy.mock.calls[0][0]).toMatchObject({
        operation: {
          operationName: 'GetDonationsTable',
          variables: {
            designationAccountIds: ['account-1'],
          },
        },
      }),
    );
  });

  it('does not filter report by designation account', async () => {
    const mutationSpy = jest.fn();
    render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<GetDonationsTableQuery>
          mocks={mocks}
          onCall={mutationSpy}
        >
          <DonationsReportTable
            accountListId={'abc'}
            onSelectContact={onSelectContact}
            time={time}
            setTime={setTime}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    await waitFor(() =>
      expect(mutationSpy.mock.calls[0][0]).toMatchObject({
        operation: {
          operationName: 'GetDonationsTable',
          variables: {
            designationAccountIds: null,
          },
        },
      }),
    );
  });

  it('is not clickable when contact is missing', async () => {
    const mocks = {
      GetDonationsTable: {
        donations: {
          nodes: [
            {
              amount: {
                amount: 10,
                convertedAmount: 10,
                convertedCurrency: 'CAD',
                currency: 'CAD',
              },
              appeal: {
                id: 'abc',
                name: 'Appeal Test 1',
              },
              donationDate: DateTime.now().minus({ minutes: 4 }).toISO(),
              donorAccount: {
                contacts: {
                  nodes: [],
                },
                displayName: 'John',
                id: 'abc',
              },
              id: 'abc',
              paymentMethod: 'pay',
            },
          ],
        },
      },
    };
    const { queryAllByText, getByText } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<GetDonationsTableQuery> mocks={mocks}>
          <DonationsReportTable
            accountListId={'abc'}
            onSelectContact={onSelectContact}
            time={time}
            setTime={setTime}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    await waitFor(() => expect(queryAllByText('John')).toHaveLength(1));

    userEvent.click(getByText('John'));
    expect(onSelectContact).not.toHaveBeenCalled();
  });

  it('hides currency column if all currencies match the account currency', async () => {
    const { getByLabelText, queryByLabelText } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<GetDonationsTableQuery> mocks={mocks}>
          <DonationsReportTable
            accountListId={'abc'}
            onSelectContact={onSelectContact}
            time={time}
            setTime={setTime}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    await waitFor(() => expect(getByLabelText('Partner')).toBeInTheDocument());
    expect(queryByLabelText('Foreign Amount')).not.toBeInTheDocument();
  });

  it('shows currency column if a currency does not match the account currency', async () => {
    const mocksWithMultipleCurrencies = cloneDeep(mocks);
    mocksWithMultipleCurrencies.GetDonationsTable.donations.nodes[0].amount.currency =
      'EUR';
    const { getByLabelText } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<GetDonationsTableQuery>
          mocks={mocksWithMultipleCurrencies}
        >
          <DonationsReportTable
            accountListId={'abc'}
            onSelectContact={onSelectContact}
            time={time}
            setTime={setTime}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    await waitFor(() => expect(getByLabelText('Partner')).toBeInTheDocument());
    expect(getByLabelText('Foreign Amount')).toBeInTheDocument();
  });

  it('updates the sort order', async () => {
    const mutationSpy = jest.fn();
    const { findByRole, getAllByRole } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<GetDonationsTableQuery>
          mocks={mocks}
          onCall={mutationSpy}
        >
          <DonationsReportTable
            accountListId={'abc'}
            onSelectContact={onSelectContact}
            time={time}
            setTime={setTime}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    const dateHeader = await findByRole('columnheader', { name: 'Date' });
    expect(
      within(dateHeader).getByTestId('ArrowDownwardIcon'),
    ).toBeInTheDocument();

    userEvent.click(await findByRole('columnheader', { name: 'Amount' }));
    const cellsAsc = getAllByRole('cell', { name: /CAD/ });
    expect(cellsAsc[0]).toHaveTextContent('10 CAD');
    expect(cellsAsc[1]).toHaveTextContent('100 CAD');

    userEvent.click(await findByRole('columnheader', { name: 'Amount' }));
    const cellsDesc = getAllByRole('cell', { name: /CAD/ });
    expect(cellsDesc[0]).toHaveTextContent('100 CAD');
    expect(cellsDesc[1]).toHaveTextContent('10 CAD');
  });

  it('updates the page size without rerendering until the month changes', async () => {
    const DonationsReportTableWrapper: React.FC = () => {
      const [time, setTime] = useState(DateTime.now());

      return (
        <DonationsReportTable
          accountListId={'abc'}
          onSelectContact={onSelectContact}
          time={time}
          setTime={setTime}
        />
      );
    };

    const mutationSpy = jest.fn();
    const { findByRole, getByRole } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<GetDonationsTableQuery>
          mocks={mocks}
          onCall={mutationSpy}
        >
          <DonationsReportTableWrapper />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    userEvent.click(await findByRole('button', { name: 'Rows per page: 25' }));
    mutationSpy.mockClear();
    userEvent.click(getByRole('option', { name: '50' }));

    expect(mutationSpy).not.toHaveBeenCalled();

    userEvent.click(getByRole('button', { name: 'Previous Month' }));

    await waitFor(() => {
      expect(mutationSpy).toHaveBeenCalledTimes(1);
      expect(mutationSpy.mock.calls[0][0]).toMatchObject({
        operation: {
          operationName: 'GetDonationsTable',
          variables: {
            pageSize: 50,
          },
        },
      });
    });
  });

  it('Ensure process bar loads when loading next page', async () => {
    const DonationsReportTableWrapper: React.FC = () => {
      const [time, setTime] = useState(DateTime.now());

      return (
        <DonationsReportTable
          accountListId={'abc'}
          onSelectContact={onSelectContact}
          time={time}
          setTime={setTime}
        />
      );
    };

    const mutationSpy = jest.fn();
    const { getByTestId } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<GetDonationsTableQuery>
          mocks={{
            GetAccountListCurrency: mocks.GetAccountListCurrency,
            GetDonationsTable: {
              donations: {
                nodes: mocks.GetDonationsTable.donations.nodes,
                pageInfo: {
                  hasNextPage: true,
                },
              },
            },
          }}
          onCall={mutationSpy}
        >
          <DonationsReportTableWrapper />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    await waitFor(() =>
      expect(getByTestId('nextPageProcessBar')).toBeInTheDocument(),
    );
  });
});
