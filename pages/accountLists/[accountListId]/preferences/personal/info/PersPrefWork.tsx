import React from 'react';
import { Typography } from '@material-ui/core';

interface WorkProps {
  employer: string;
  occupation: string;
}

const PersPrefWork: React.FC<WorkProps> = ({ employer, occupation }) => {
  const separator = occupation && employer ? ' - ' : '';

  if (occupation || employer) {
    return (
      <Typography gutterBottom>
        {occupation} {separator} {employer}
      </Typography>
    );
  }

  return null;
};

export default PersPrefWork;
