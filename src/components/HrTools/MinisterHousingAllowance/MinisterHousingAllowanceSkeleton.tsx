import React from 'react';
import { Skeleton } from '@mui/material';
import { mainContentWidth } from './MinisterHousingAllowance';

export const MinisterHousingAllowanceReportSkeleton: React.FC = () => {
  return (
    <>
      <Skeleton
        variant="rounded"
        width="100%"
        sx={{ maxWidth: mainContentWidth }}
        height={35}
        style={{
          marginBottom: '16px',
        }}
      />
      <Skeleton
        variant="rounded"
        width="100%"
        sx={{ maxWidth: mainContentWidth }}
        height={75}
        style={{
          marginBottom: '16px',
        }}
      />
      <Skeleton
        variant="rounded"
        width="100%"
        sx={{ maxWidth: mainContentWidth }}
        height={110}
        style={{
          marginBottom: '16px',
        }}
      />
      <Skeleton
        variant="rounded"
        width="100%"
        sx={{ maxWidth: mainContentWidth }}
        height={300}
        style={{
          marginBottom: '16px',
        }}
      />
    </>
  );
};
