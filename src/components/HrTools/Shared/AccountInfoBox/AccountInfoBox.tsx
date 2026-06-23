import React from 'react';
import { InfoOutlined } from '@mui/icons-material';
import { Box, Tooltip, Typography } from '@mui/material';
import { Trans } from 'react-i18next';
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

  const title = (
    <Trans>
      Your Person Number is unique and assigned to you by Oracle HCM, Cru&apos;s
      new HR system. It replaces the Employee ID (EMPLID) previously used in
      PeopleSoft. If you need help with anything related to HR or payroll —
      salary calculations, housing allowance, or additional salary requests —
      this is the number HR staff will use to look you up in the system.
    </Trans>
  );

  return (
    <Box
      display="flex"
      flexDirection="row"
      gap={3}
      mb={2}
      data-testid="account-info"
    >
      <Typography data-testid="name">{name}</Typography>
      {accountId && (
        <Box display="flex" alignItems="center" gap={0.5}>
          <Typography data-testid="account-id">{accountId}</Typography>
          <Tooltip title={title}>
            <InfoOutlined fontSize="small" />
          </Tooltip>
        </Box>
      )}
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
