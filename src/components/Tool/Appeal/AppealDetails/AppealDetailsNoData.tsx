import { Box, styled, Typography } from '@material-ui/core';
import React, { ReactElement } from 'react';
import { useAppealContext } from '../AppealContextProvider/AppealContextProvider';

const StyledBox = styled(Box)(({ theme }) => ({
  width: '100%',
  border: '1px solid',
  borderColor: theme.palette.cruGrayMedium.main,
  marginTop: 30,
  backgroundColor: theme.palette.cruGrayLight.main,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: theme.spacing(12),
  borderRadius: 5,
}));

export interface Props {
  dataType: string;
}

const renderCase = (dataType: string): string => {
  switch (dataType) {
    case 'given':
      return 'No donations yet towards this appeal';
    case 'received':
      return 'No gifts have been received and not yet processed to this appeal';
    case 'commited':
      return 'No contacts with commitments have committed to this appeal';
    case 'asked':
      return 'No contacts have been asked for this appeal';
    case 'excluded':
      return 'No contacts have been excluded from this appeal';
    default:
      return '';
  }
};

const NoData = (): ReactElement => {
  const { appealState } = useAppealContext();

  return (
    <StyledBox>
      <Typography>{renderCase(appealState.subDisplay)}</Typography>
    </StyledBox>
  );
};

export default NoData;
