import React from 'react';
import DonationHistories from '../../../Dashboard/DonationHistories';
import { useGetDonationGraphQuery } from '../GetDonationGraph.generated';

interface Props {
  accountListId: string;
}

export const MonthlyActivitySection: React.FC<Props> = ({ accountListId }) => {
  const { data } = useGetDonationGraphQuery({
    variables: { accountListId },
  });

  return (
    <>
      <DonationHistories
        goal={data?.accountList.monthlyGoal ?? undefined}
        pledged={data?.accountList.totalPledges}
        reportsDonationHistories={data?.reportsDonationHistories}
        currencyCode={data?.accountList.currency}
      />
    </>
  );
};
