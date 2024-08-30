import { UseGetPledgeOrDonation } from 'src/components/Tool/Appeal/Shared/useGetPledgeOrDonation/useGetPledgeOrDonation';
import theme from 'src/theme';

export const AmountAndFrequency: React.FC<
  Pick<UseGetPledgeOrDonation, 'amountAndFrequency' | 'pledgeOverdue'>
> = ({ amountAndFrequency, pledgeOverdue }) => {
  const amount = amountAndFrequency?.amount ?? '';
  const dateString = amountAndFrequency?.dateOrFrequency ? (
    <span
      style={{
        color: pledgeOverdue ? theme.palette.statusDanger.main : 'inherit',
      }}
    >
      {amountAndFrequency?.dateOrFrequency}
    </span>
  ) : (
    ''
  );
  return (
    <>
      {amount} {dateString}
    </>
  );
};
