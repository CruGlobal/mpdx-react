import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@material-ui/core';
import { DateTime } from 'luxon';
import theme from '../../../../theme';
import { GetDonationsTableQuery } from '../GetDonationsTable.generated';
import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';
import { DonationsReportTable } from './DonationsReportTable';

const time = new DateTime();
const setTime = jest.fn();

it('renders with data', async () => {
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
              amount: 10,
              amountCurrency: 'CAD',
              createdAt: DateTime.now().minus({ month: 3 }).toISO(),
              id: 'abc',
              name: 'John',
            },
            donationDate: DateTime.now().minus({ minutes: 4 }).toISO(),
            donorAccount: {
              displayName: 'John',
              id: 'abc',
            },
            id: 'abc',
            paymentMethod: 'pay',
          },
          {
            amount: {
              amount: 10,
              convertedAmount: 10,
              convertedCurrency: 'CAD',
              currency: 'CAD',
            },
            appeal: {
              amount: 10,
              amountCurrency: 'CAD',
              createdAt: DateTime.now().minus({ month: 3 }).toISO(),
              id: 'abc',
              name: 'John',
            },
            donationDate: DateTime.now().minus({ minutes: 5 }).toISO(),
            donorAccount: {
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

  const { getAllByTestId, queryAllByRole, queryByRole } = render(
    <ThemeProvider theme={theme}>
      <GqlMockedProvider<GetDonationsTableQuery> mocks={mocks}>
        <DonationsReportTable
          accountListId={'abc'}
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
});

it('renders empty', async () => {
  const mocks = {
    GetDonationsTable: {
      donations: {
        nodes: [],
      },
    },
  };

  const { queryByTestId, queryAllByRole, queryByRole } = render(
    <ThemeProvider theme={theme}>
      <GqlMockedProvider<GetDonationsTableQuery> mocks={mocks}>
        <DonationsReportTable
          accountListId={'abc'}
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

  expect(queryByTestId('donationRow')).not.toBeInTheDocument();
});
