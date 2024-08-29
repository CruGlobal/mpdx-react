import { UseGetPledgeOrDonation } from 'src/components/Tool/Appeal/Shared/useGetPledgeOrDonation/useGetPledgeOrDonation';
import theme from 'src/theme';

export const AmountAndFrequency: React.FC<
  Omit<UseGetPledgeOrDonation, 'pledgeValues' | 'pledgeDonations'>
> = ({ amountAndFrequency, pledgeOverdue }) => {
  const amount = amountAndFrequency?.length ? amountAndFrequency[0] : '';
  const dateString =
    amountAndFrequency?.length === 2 ? (
      <span
        style={{
          color: pledgeOverdue ? theme.palette.statusDanger.main : 'inherit',
        }}
      >
        {amountAndFrequency[1]}
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
