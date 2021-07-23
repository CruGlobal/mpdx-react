import React, { ReactElement } from 'react';
import { GetExpectedMonthlyTotalsQuery } from '../../../../pages/accountLists/[accountListId]/reports/GetExpectedMonthlyTotals.generated';
import { GqlMockedProvider } from '../../../../__tests__/util/graphqlMocking';
import { ExpectedMonthlyTotalReport } from './ExpectedMonthlyTotalReport';

export default {
  title: 'Reports/ExpectedMonthlyTotal',
};

export const Default = (): ReactElement => {
  return (
    <GqlMockedProvider<GetExpectedMonthlyTotalsQuery>>
      <ExpectedMonthlyTotalReport accountListId={'abc'} />
    </GqlMockedProvider>
  );
};

export const Empty = (): ReactElement => {
  const mocks = {
    GetExpectedMonthlyTotals: {
      expectedMonthlyTotalReport: {
        received: {
          donations: [],
        },
        likely: {
          donations: [],
        },
        unlikely: {
          donations: [],
        },
      },
    },
  };

  return (
    <GqlMockedProvider<GetExpectedMonthlyTotalsQuery> mocks={mocks}>
      <ExpectedMonthlyTotalReport accountListId={'abc'} />
    </GqlMockedProvider>
  );
};
