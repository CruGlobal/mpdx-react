import React from 'react';
import { Typography } from '@mui/material';

interface WorkProps {
  employer: string;
  occupation: string;
}

export const PersPrefWork: React.FC<WorkProps> = ({ employer, occupation }) => {
  const separator = occupation && employer ? ' - ' : '';

  if (occupation || employer) {
    return (
      <Typography component="h4">
        {occupation} {separator} {employer}
      </Typography>
    );
  }

  return null;
};
