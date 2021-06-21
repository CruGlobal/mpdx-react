import React from 'react';
import { Box, Typography } from '@material-ui/core';
import InfoIcon from '@material-ui/icons/Info';
import ErrorIcon from '@material-ui/icons/Error';

interface Props {
  message: string;
  padding?: number;
  size?: 'inherit' | 'default' | 'small' | 'large';
  type: 'error' | 'info';
}

export const Notification: React.FC<Props> = ({
  message,
  padding = 5,
  size,
  type,
}) => {
  const color = type === 'error' ? 'error' : undefined;

  return (
    <Box display="flex" alignItems="center" p={padding}>
      {type === 'error' ? (
        <ErrorIcon color="error" fontSize={size} />
      ) : (
        <InfoIcon fontSize={size} />
      )}

      <Box ml={2}>
        <Typography variant="body1" color={color}>
          {message}
        </Typography>
      </Box>
    </Box>
  );
};
