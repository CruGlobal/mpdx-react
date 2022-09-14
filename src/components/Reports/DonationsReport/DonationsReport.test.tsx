import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { DateTime } from 'luxon';
import theme from '../../../theme';
import { GqlMockedProvider } from '../../../../__tests__/util/graphqlMocking';
import { DonationsReport } from './DonationsReport';

const title = 'test title';
const onNavListToggle = jest.fn();

it('renders', async () => {
  const { getByTestId, getByText, queryByRole, queryAllByRole, queryByTestId } =
    render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider>
          <DonationsReport
            accountListId={'abc'}
            isNavListOpen={true}
            onNavListToggle={onNavListToggle}
            title={title}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

  await waitFor(() =>
    expect(queryByRole('progressbar')).not.toBeInTheDocument(),
  );
  expect(getByText(title)).toBeInTheDocument();
  expect(getByTestId('DonationHistoriesBoxEmpty')).toBeInTheDocument();
  expect(queryByTestId('DonationHistoriesGridLoading')).not.toBeInTheDocument();
  expect(queryAllByRole('button')[1]).toBeInTheDocument();
});

it('renders with data', async () => {
  const mocks = {
    GetDonationGraph: {
      accountList: {
        currency: 'CAD',
        monthlyGoal: 100,
        totalPledges: 10,
      },
      reportsDonationHistories: {
        averageIgnoreCurrent: 10,
        periods: [
          {
            startDate: DateTime.now().minus({ months: 12 }).toISO(),
            convertedTotal: 10,
            totals: [
              {
                currency: 'CAD',
                convertedAmount: 10,
              },
            ],
          },
          {
            startDate: DateTime.now().minus({ months: 11 }).toISO(),
            convertedTotal: 10,
            totals: [
              {
                currency: 'CAD',
                convertedAmount: 10,
              },
            ],
          },
        ],
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
        ],
      },
    },
  };

  const { getByTestId, queryByRole, queryByTestId } = render(
    <ThemeProvider theme={theme}>
      <GqlMockedProvider mocks={mocks}>
        <DonationsReport
          accountListId={'abc'}
          isNavListOpen={true}
          onNavListToggle={onNavListToggle}
          title={title}
        />
      </GqlMockedProvider>
    </ThemeProvider>,
  );

  await waitFor(() =>
    expect(queryByRole('progressbar')).not.toBeInTheDocument(),
  );
  expect(getByTestId('DonationHistoriesTypographyAverage')).toBeInTheDocument();
  expect(queryByTestId('DonationHistoriesGridLoading')).not.toBeInTheDocument();
  expect(getByTestId('donationRow')).toBeInTheDocument();
});
