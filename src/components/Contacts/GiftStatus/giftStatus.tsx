import React from 'react';
import ErrorIcon from '@material-ui/icons/Error';
import Circle from '@material-ui/icons/FiberManualRecord';
import { Box } from '@material-ui/core';

interface Props {
  isHidden?: boolean;
  isLate?: boolean;
}
export const GiftStatus: React.FC<Props> = ({ isHidden, isLate }) => {
  return (
    <>
      {isHidden ? (
        <Box data-testid="giftStatushidden" />
      ) : (
        <>
          {isLate ? (
            <ErrorIcon
              style={{ color: '#F44336' }}
              data-testid="giftStatusLate"
            />
          ) : (
            <Circle
              style={{ color: '#00CA99' }}
              data-testid="giftStatusOnTime"
            />
          )}
        </>
      )}
    </>
  );
};

export default GiftStatus;
