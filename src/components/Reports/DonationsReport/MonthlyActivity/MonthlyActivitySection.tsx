import { DateTime } from 'luxon';
import React from 'react';
import DonationHistories from '../../../Dashboard/DonationHistories';
import { useGetDonationGraphQuery } from '../GetDonationGraph.generated';

interface Props {
  accountListId: string;
  designationAccounts?: string[];
  setTime?: (time: DateTime) => void;
}

export const MonthlyActivitySection: React.FC<Props> = ({
  accountListId,
  designationAccounts,
  setTime,
}) => {
  const { data } = useGetDonationGraphQuery({
    variables: {
      accountListId,
      designationAccountIds: designationAccounts?.length
        ? designationAccounts
        : null,
    },
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
