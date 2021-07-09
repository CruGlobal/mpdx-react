import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@material-ui/core';
import theme from '../../../../theme';
import {
  ExpectedDonationRowFragment,
  GetExpectedMonthlyTotalsQuery,
} from '../../../../../pages/accountLists/[accountListId]/reports/GetExpectedMonthlyTotals.generated';
import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';
import { ExpectedMonthlyTotalReportTable } from './ExpectedMonthlyTotalReportTable';

it('renders empty', async () => {
  const empty: ExpectedDonationRowFragment[] = [];
  const { queryByRole } = render(
    <ThemeProvider theme={theme}>
      <GqlMockedProvider<GetExpectedMonthlyTotalsQuery>>
        <ExpectedMonthlyTotalReportTable
          accountListId={'abc'}
          title={'Donations So Far This Month'}
          data={empty}
          donations={true}
          total={0}
          currency={'USD'}
        />
      </GqlMockedProvider>
    </ThemeProvider>,
  );

  expect(queryByRole('button')).not.toBeInTheDocument();
});
