import React from 'react';
import { Box, Typography } from '@mui/material';

interface AccountInfoBoxProps {
  name?: string;
  accountId?: string;
}

export const AccountInfoBox: React.FC<AccountInfoBoxProps> = ({
  name,
  accountId,
}) => (
  <Box
    display="flex"
    flexDirection="row"
    gap={3}
    mb={2}
    data-testid="account-info"
  >
    <Typography data-testid="name">{name}</Typography>
    <Typography data-testid="account-id">{accountId}</Typography>
  </Box>
);
