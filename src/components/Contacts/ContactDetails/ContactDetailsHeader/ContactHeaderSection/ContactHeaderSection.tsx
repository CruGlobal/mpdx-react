import { Box, styled } from '@mui/material';

import React, { ReactElement, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  icon?: ReactNode;
}

const IconWrap = styled(Box)(({}) => ({
  display: 'flex',
  width: 64,
  padding: 8,
  justifyContent: 'center',
}));
const DetailWrap = styled(Box)(({}) => ({
  width: '100%',
  display: 'flex',
  padding: 8,
  flexDirection: 'column',
}));

export const ContactHeaderSection = ({
  icon,
  children,
}: Props): ReactElement => {
  return (
    <Box display="flex" alignItems="start">
      <IconWrap>{icon}</IconWrap>
      <DetailWrap>{children}</DetailWrap>
    </Box>
  );
};
