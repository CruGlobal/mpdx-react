import { Box, styled } from '@material-ui/core';

import React, { ReactElement, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  icon?: ReactNode;
}

const IconWrap = styled(Box)(({}) => ({
  display: 'flex',
  width: 64,
  padding: 0,
  justifyContent: 'center',
}));
const DetailWrap = styled(Box)(({}) => ({
  display: 'flex',
  padding: 8,
  flexDirection: 'column',
}));

export const ContactHeaderSection = ({
  icon,
  children,
}: Props): ReactElement => {
  return (
    <Box display="flex">
      <IconWrap>{icon}</IconWrap>
      <DetailWrap>{children}</DetailWrap>
    </Box>
  );
};
