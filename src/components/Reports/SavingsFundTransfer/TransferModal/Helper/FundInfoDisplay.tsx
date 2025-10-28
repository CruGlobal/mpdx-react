import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import {
  ConferenceSavingsAccount,
  PrimaryAccount,
  SavingsAccount,
} from '../../Helper/TransferIcons';
import { FundFieldsFragment } from '../../ReportsSavingsFund.generated';
import { FundTypeEnum } from '../../mockData';

type Fund = Pick<FundFieldsFragment, 'fundType' | 'balance'>;

interface FundInfoDisplayProps {
  fund?: Fund;
}

export const FundInfoDisplay: React.FC<FundInfoDisplayProps> = ({ fund }) => {
  const { t } = useTranslation();
  const locale = useLocale();

  if (!fund) {
    return null;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {fund.fundType === FundTypeEnum.Primary
        ? PrimaryAccount
        : fund.fundType === FundTypeEnum.Savings
          ? SavingsAccount
          : ConferenceSavingsAccount}{' '}
      <Box
        sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          minWidth: 0,
        }}
      >
        <Typography component="span">
          <b>{t('{{type}}', { type: fund.fundType })}</b>
          <b>{' \u00B7 '}</b>
        </Typography>
        <Typography
          component="span"
          sx={{ color: fund.balance < 0 ? 'error.main' : 'text.primary' }}
        >
          {fund.balance < 0 ? ' (' : ' '}
          {currencyFormat(Math.abs(fund.balance), 'USD', locale, {
            showTrailingZeros: true,
          })}
          {fund.balance < 0 ? ')' : ' available'}
        </Typography>
      </Box>
    </Box>
  );
};
