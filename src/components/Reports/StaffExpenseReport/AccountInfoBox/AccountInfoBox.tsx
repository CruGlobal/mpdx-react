import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface AccountInfoBoxProps {
  name?: string;
  accountId?: string;
}

export const AccountInfoBox: React.FC<AccountInfoBoxProps> = ({
  name,
  accountId,
}) => {
  const { t } = useTranslation();

  return (
    <Box
      display="flex"
      flexDirection="row"
      gap={3}
      mb={2}
      data-testid="account-info"
    >
      <Typography data-testid="name">{t(name ?? '')}</Typography>
      <Typography data-testid="account-id">{t(accountId ?? '')}</Typography>
    </Box>
  );
};
