import React from 'react';
import { Skeleton } from '@mui/material';
import { mainContentWidth } from '../../MinisterHousingAllowance';

export const RentOwnSkeleton: React.FC = () => {
  return (
    <>
      <Skeleton
        variant="rounded"
        width={mainContentWidth}
        height={35}
        style={{
          marginBottom: '16px',
        }}
      />
      <Skeleton variant="rounded" width={mainContentWidth} height={35} />
    </>
  );
};
