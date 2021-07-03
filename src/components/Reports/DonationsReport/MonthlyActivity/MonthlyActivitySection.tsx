import React from 'react';
import DonationHistories from '../../../Dashboard/DonationHistories';
import { GetDashboardQuery } from '../../../../../pages/accountLists/GetDashboard.generated';

interface Props {
  data: GetDashboardQuery;
}

export const MonthlyActivitySection: React.FC<Props> = (
  {
    /*data*/
  },
) => {
  return (
    <DonationHistories
    /*goal={data.accountList.monthlyGoal ?? undefined}
      pledged={data.accountList.totalPledges}
      reportsDonationHistories={data.reportsDonationHistories}
      currencyCode={data.accountList.currency}*/
    />
  );
};
