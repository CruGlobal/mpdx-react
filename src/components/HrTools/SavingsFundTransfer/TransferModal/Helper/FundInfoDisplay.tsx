import { Box, Typography } from '@mui/material';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { getFundIcon } from '../../Helper/TransferIcons';
import { availableBalance } from '../../Helper/availableBalance';
import { FundFieldsFragment } from '../../ReportsSavingsFund.generated';

type Fund = Pick<
  FundFieldsFragment,
  'fundType' | 'endBalance' | 'availableBalance' | 'deficitLimit'
>;

interface FundInfoDisplayProps {
  fund?: Fund;
}

export const FundInfoDisplay: React.FC<FundInfoDisplayProps> = ({ fund }) => {
  const locale = useLocale();

  if (!fund) {
    return null;
  }

  // Show the same figure the transfer form validates against, so the menu
  // never advertises more than a transfer would actually allow.
  const available = availableBalance(fund);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {getFundIcon(fund.fundType)}
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
          sx={{ color: available < 0 ? 'error.main' : 'text.primary' }}
        >
          {available < 0 ? ' (' : ' '}
          {currencyFormat(Math.abs(available), 'USD', locale, {
            showTrailingZeros: true,
          })}
          {available < 0 ? ')' : ' available'}
        </Typography>
      </Box>
    </Box>
  );
};
