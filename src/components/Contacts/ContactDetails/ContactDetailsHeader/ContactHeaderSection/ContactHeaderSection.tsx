import React, { ReactElement, ReactNode } from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

interface Props {
  children?: ReactNode;
  icon?: ReactNode;
  rightIcon?: ReactNode;
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
  rightIcon,
  children,
}: Props): ReactElement => {
  return (
    <Box display="flex" alignItems="start">
      <IconWrap>{icon}</IconWrap>
      <DetailWrap>{children}</DetailWrap>
      {rightIcon}
    </Box>
  );
};
