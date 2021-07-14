import React, { ReactElement } from 'react';
import {
  GetExpectedMonthlyTotalsDocument,
  GetExpectedMonthlyTotalsQuery,
  GetExpectedMonthlyTotalsQueryVariables,
} from '../../../../../pages/accountLists/[accountListId]/reports/GetExpectedMonthlyTotals.generated';
import { gqlMock } from '../../../../../__tests__/util/graphqlMocking';
import { ExpectedMonthlyTotalReportHeader } from './ExpectedMonthlyTotalReportHeader';

export default {
  title: 'Reports/ExpectedMonthlyTotal/Header',
};

export const Default = (): ReactElement => {
  const data = gqlMock<
    GetExpectedMonthlyTotalsQuery,
    GetExpectedMonthlyTotalsQueryVariables
  >(GetExpectedMonthlyTotalsDocument, { variables: { accountListId: 'abc' } });

  const totalDonations = data.expectedMonthlyTotalReport.received.total;

  const totalLikely = data.expectedMonthlyTotalReport.received.total;

  const totalUnlikely = data.expectedMonthlyTotalReport.received.total;

  const total = totalUnlikely + totalDonations + totalLikely;

  return (
    <ExpectedMonthlyTotalReportHeader
      empty={false}
      totalDonations={totalDonations}
      totalLikely={totalLikely}
      totalUnlikely={totalUnlikely}
      total={total}
      currency={data.expectedMonthlyTotalReport.currency || ''}
    />
  );
};

export const NoDonations = (): ReactElement => {
  return (
    <ExpectedMonthlyTotalReportHeader
      empty={true}
      totalDonations={0}
      totalLikely={0}
      totalUnlikely={0}
      total={0}
      currency={''}
    />
  );
};
