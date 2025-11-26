import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { useLandingData } from '../useLandingData';

export const StaffNameCard: React.FC = () => {
  const { self, spouse, hasSpouse, staffAccountId } = useLandingData();
  const lastName = self?.staffInfo.lastName || '';
  const firstName = self?.staffInfo.firstName || '';
  const spouseFirstName = hasSpouse ? spouse?.staffInfo.firstName || '' : '';

  return (
    <Card sx={{ my: 3 }}>
      <CardContent>
        <Typography variant="h5">
          {lastName}, {firstName}
          {spouseFirstName && ` and ${spouseFirstName}`}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {staffAccountId}
        </Typography>
      </CardContent>
    </Card>
  );
};
