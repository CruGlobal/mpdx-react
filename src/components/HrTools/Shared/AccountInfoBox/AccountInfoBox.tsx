import React from 'react';
import { Box, Typography } from '@mui/material';

interface AccountInfoBoxProps {
  name?: string;
}

export const AccountInfoBox: React.FC<AccountInfoBoxProps> = ({ name }) => {
  return (
    <Box
      display="flex"
      flexDirection="row"
      gap={3}
      mb={2}
      data-testid="account-info"
    >
      <Typography data-testid="name">{name}</Typography>
    </Box>
  );
};
