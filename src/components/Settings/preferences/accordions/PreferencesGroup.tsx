import { Box, Typography } from '@mui/material';
import React from 'react';

interface PreferencesGroupProps {
  title: string;
  children?: React.ReactNode;
}

export const PreferencesGroup: React.FC<PreferencesGroupProps> = ({
  title,
  children,
}) => {
  return (
    <Box component="section" marginTop={3}>
      <Typography component="h3" variant="h5" marginBottom={1}>
        {title}
      </Typography>
      {children}
    </Box>
  );
};
