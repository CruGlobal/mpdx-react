import React, { ReactElement } from 'react';
import { DateTime } from 'luxon';
import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';
import { MonthlyActivitySection } from './MonthlyActivitySection';
import { GetDonationsGraphQuery } from 'src/components/Contacts/ContactDetails/ContactDontationsTab/DonationsGraph/DonationsGraph.generated';

export default {
  title: 'Reports/DonationsReport/MonthlyActivity',
};

export const Default = (): ReactElement => {
  return (
    <GqlMockedProvider<GetDonationsGraphQuery>
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
      }}
    >
      <MonthlyActivitySection accountListId={'abc'} setTime={() => {}} />
    </GqlMockedProvider>
  );
};

export const Empty = (): ReactElement => {
  return (
    <GqlMockedProvider<GetDonationsGraphQuery>
      mocks={{
        GetDonationGraph: {
          accountList: {
            currency: 'CAD',
            monthlyGoal: 0,
            totalPledges: 0,
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
      }}
    >
      <MonthlyActivitySection accountListId={'abc'} setTime={() => {}} />
    </GqlMockedProvider>
  );
};
