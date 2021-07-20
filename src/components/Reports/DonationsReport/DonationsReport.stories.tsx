import React, { ReactElement } from 'react';
import { DateTime } from 'luxon';
import { GqlMockedProvider } from '../../../../__tests__/util/graphqlMocking';
import { DonationsReport } from './DonationsReport';

export default {
  title: 'Reports/DonationsReport',
};

export const Default = (): ReactElement => {
  return (
    <GqlMockedProvider
      mocks={{
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
                    convertedAmount: 70,
                  },
                ],
              },
              {
                startDate: DateTime.now().minus({ months: 11 }).toISO(),
                convertedTotal: 10,
                totals: [
                  {
                    currency: 'USD',
                    convertedAmount: 50,
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
      }}
    >
      <DonationsReport accountListId={'abc'} />
    </GqlMockedProvider>
  );
};

export const Empty = (): ReactElement => {
  return (
    <GqlMockedProvider
      mocks={{
        GetDonationGraph: {
          accountList: {
            currency: 'CAD',
            monthlyGoal: 100,
            totalPledges: 10,
          },
          reportsDonationHistories: {
            averageIgnoreCurrent: 0,
            periods: [
              {
                startDate: DateTime.now().minus({ months: 12 }).toISO(),
                convertedTotal: 0,
                totals: [
                  {
                    currency: 'CAD',
                    convertedAmount: 0,
                  },
                ],
              },
              {
                startDate: DateTime.now().minus({ months: 11 }).toISO(),
                convertedTotal: 0,
                totals: [
                  {
                    currency: 'CAD',
                    convertedAmount: 0,
                  },
                ],
              },
            ],
          },
        },
        GetDonationsTable: {
          donations: {
            nodes: [],
          },
        },
      }}
    >
      <DonationsReport accountListId={'abc'} />
    </GqlMockedProvider>
  );
};
