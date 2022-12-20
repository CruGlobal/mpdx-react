import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { DateTime } from 'luxon';
import theme from '../../../../theme';
import { GetDonationsTableQuery } from '../GetDonationsTable.generated';
import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';
import { DonationsReportTable } from './DonationsReportTable';

const time = DateTime.now();
const setTime = jest.fn();

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
            name: 'Appeal Test 1',
          },
          donationDate: DateTime.now().minus({ minutes: 4 }).toISO(),
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
            amount: 10,
            convertedAmount: 10,
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
    },
  },
};

it('renders with data', async () => {
  const { getAllByTestId, queryAllByRole, queryByRole, queryAllByText } =
    render(
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

  await waitFor(() => expect(queryAllByText('Appeal Test 1')).toHaveLength(1));

  expect(getAllByTestId('appeal-name')).toHaveLength(2);
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

it('renders contact link', async () => {
  const { queryAllByRole, queryAllByText } = render(
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

  await waitFor(() => expect(queryAllByText('John')).toHaveLength(2));

  expect((queryAllByRole('link')[0] as HTMLLinkElement).href).toContain(
    'contact1',
  );
});

it('renders no contact link when missing', async () => {
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
  const { queryAllByRole, queryAllByText } = render(
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

  await waitFor(() => expect(queryAllByText('John')).toHaveLength(1));

  expect(queryAllByRole('link').length).toBe(0);
});
