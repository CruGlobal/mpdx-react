import { DateTime } from 'luxon';
import React from 'react';
import DonationHistories from '../../../Dashboard/DonationHistories';
import { useGetDonationGraphQuery } from '../GetDonationGraph.generated';

interface Props {
  accountListId: string;
  setTime?: (time: DateTime) => void;
}

export const MonthlyActivitySection: React.FC<Props> = ({
  accountListId,
  setTime,
}) => {
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
        setTime={setTime || undefined}
      />
    </>
  );
};
