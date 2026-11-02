import React, { ReactElement, ReactNode } from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

interface Props {
  children?: ReactNode;
  icon?: ReactNode;
  rightIcon?: ReactNode;
  // Hide the section on phones when the contact has no value for it
  empty?: boolean;
}

const IconWrap = styled(Box)(({}) => ({
  display: 'flex',
  width: 64,
  padding: 8,
  justifyContent: 'center',
}));
const DetailWrap = styled(Box)(({}) => ({
  width: '100%',
  minWidth: 0,
  display: 'flex',
  padding: 8,
  flexDirection: 'column',
}));

export const ContactHeaderSection = ({
  icon,
  rightIcon,
  children,
  empty = false,
}: Props): ReactElement => {
  return (
    <Box
      display={empty ? { xs: 'none', sm: 'flex' } : 'flex'}
      alignItems="start"
    >
      <IconWrap>{icon}</IconWrap>
      <DetailWrap>{children}</DetailWrap>
      {rightIcon}
    </Box>
  );
};
