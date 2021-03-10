import React, { ReactElement } from 'react';
import ErrorIcon from '@material-ui/icons/Error';
import Circle from '@material-ui/icons/FiberManualRecord';
import { Box, hexToRgb } from '@material-ui/core';

interface Props {
  isHidden?: boolean;
  isLate?: boolean;
}
const GiftStatus = ({ isHidden, isLate }: Props): ReactElement => {
  return (
    <>
      {isHidden ? (
        <Box data-testid="giftStatushidden" />
      ) : (
        <>
          {isLate ? (
            <ErrorIcon
              style={{ color: hexToRgb('#F44336') }}
              data-testid="giftStatusLate"
            />
          ) : (
            <Circle
              style={{ color: hexToRgb('#00CA99') }}
              data-testid="giftStatusOnTime"
            />
          )}
        </>
      )}
    </div>
  );
};

export default GiftStatus;
