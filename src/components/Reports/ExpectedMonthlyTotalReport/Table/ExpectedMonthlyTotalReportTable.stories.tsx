import React, { ReactElement } from 'react';
import { gqlMock } from '../../../../../__tests__/util/graphqlMocking';
import {
  GetExpectedMonthlyTotalsDocument,
  GetExpectedMonthlyTotalsQuery,
  GetExpectedMonthlyTotalsQueryVariables,
} from '../../../../../pages/accountLists/[accountListId]/reports/GetExpectedMonthlyTotals.generated';
import { ExpectedMonthlyTotalReportTable } from './ExpectedMonthlyTotalReportTable';

export default {
  title: 'Reports/ExpectedMonthlyTotal/Table',
};

export const DonationsTable = (): ReactElement => {
  const data = gqlMock<
    GetExpectedMonthlyTotalsQuery,
    GetExpectedMonthlyTotalsQueryVariables
  >(GetExpectedMonthlyTotalsDocument, { variables: { accountListId: 'abc' } });

  return (
    <ExpectedMonthlyTotalReportTable
      accountListId={'abc'}
      title={'Donations So Far This Month'}
      data={data.expectedMonthlyTotalReport.received.donations}
      donations={true}
      total={0}
      currency={'USD'}
    />
  );
};

export const NotDonations = (): ReactElement => {
  const data = gqlMock<
    GetExpectedMonthlyTotalsQuery,
    GetExpectedMonthlyTotalsQueryVariables
  >(GetExpectedMonthlyTotalsDocument, { variables: { accountListId: 'abc' } });

  return (
    <ExpectedMonthlyTotalReportTable
      accountListId={'abc'}
      title={'Likely Partners This Month'}
      data={data.expectedMonthlyTotalReport.received.donations}
      donations={false}
      total={0}
      currency={'USD'}
    />
  );
};
