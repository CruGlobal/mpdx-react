import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import InfoIcon from '@mui/icons-material/Info';
import ErrorIcon from '@mui/icons-material/Error';

interface Props {
  message: string;
  padding?: number;
  size?: 'inherit' | 'medium' | 'small' | 'large';
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
    <div data-testid="Notification">
      <Box display="flex" alignItems="center" p={padding}>
        {type === 'error' ? (
          <ErrorIcon
            data-testid="NotificationErrorIcon"
            color="error"
            fontSize={size}
          />
        ) : (
          <InfoIcon data-testid="NotificationInfoIcon" fontSize={size} />
        )}

        <Box ml={2}>
          <Typography variant="body1" color={color}>
            {message}
          </Typography>
        </Box>
      </Box>
    </div>
  );
};
