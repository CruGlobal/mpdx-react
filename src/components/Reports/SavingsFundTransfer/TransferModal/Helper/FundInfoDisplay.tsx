import { Box, Typography } from '@mui/material';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import {
  ConferenceSavingsAccount,
  PrimaryAccount,
  SavingsAccount,
} from '../../Helper/TransferIcons';
import { FundFieldsFragment } from '../../ReportsSavingsFund.generated';
import { FundTypeEnum } from '../../mockData';

type Fund = Pick<FundFieldsFragment, 'fundType' | 'endBalance'>;

interface FundInfoDisplayProps {
  fund?: Fund;
}

export const FundInfoDisplay: React.FC<FundInfoDisplayProps> = ({ fund }) => {
  const locale = useLocale();

  if (!fund) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {fund.fundType === FundTypeEnum.Primary
        ? PrimaryAccount
        : fund.fundType === FundTypeEnum.Savings
          ? SavingsAccount
          : ConferenceSavingsAccount}
      <Box
        sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        <Typography component="span">
          <b>{fund.fundType}</b>
          <b>{' \u00B7 '}</b>
        </Typography>
        <Typography
          component="span"
          sx={{ color: fund.endBalance < 0 ? 'error.main' : 'text.primary' }}
        >
          {fund.endBalance < 0 ? ' (' : ' '}
          {currencyFormat(Math.abs(fund.endBalance), 'USD', locale, {
            showTrailingZeros: true,
          })}
          {fund.endBalance < 0 ? ')' : ' available'}
        </Typography>
      </Box>
    </Box>
  );
};
