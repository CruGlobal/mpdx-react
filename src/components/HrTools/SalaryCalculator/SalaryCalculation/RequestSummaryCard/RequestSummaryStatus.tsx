import React from 'react';
import { Typography } from '@mui/material';
import { useSpouseCapFirst } from '../useSpouseCapFirst';
import { SpouseCapFirstAlert } from './SpouseCapFirstAlert';

interface RequestSummaryStatusProps {
  children: React.ReactNode;
}

/** The summary's status message, or the spouse-first alert in its place while that applies */
export const RequestSummaryStatus: React.FC<RequestSummaryStatusProps> = ({
  children,
}) => {
  const { blocked, ...alertProps } = useSpouseCapFirst();

  if (blocked) {
    return <SpouseCapFirstAlert {...alertProps} />;
  }
  return (
    <Typography variant="body1" pb={2} data-testid="RequestSummaryCard-status">
      {children}
    </Typography>
  );
};
