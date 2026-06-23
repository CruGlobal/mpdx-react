import React from 'react';
import { Box, Typography } from '@mui/material';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';

interface AccountInfoBoxProps {
  name?: string;
  accountId?: string;
  overallBalance?: number;
}

export const AccountInfoBox: React.FC<AccountInfoBoxProps> = ({
  name,
  accountId,
  overallBalance,
}) => {
  const locale = useLocale();
  const currency = 'USD';

  return (
    <Box
      display="flex"
      flexDirection="row"
      gap={3}
      mb={2}
      data-testid="account-info"
    >
      <Typography data-testid="name">{name}</Typography>
      <Typography data-testid="account-id">{accountId}</Typography>
      {overallBalance && (
        <Typography data-testid="overall-balance">
          {currencyFormat(overallBalance, currency, locale, {
            showTrailingZeros: true,
          })}
        </Typography>
      )}
    </Box>
  );
};
