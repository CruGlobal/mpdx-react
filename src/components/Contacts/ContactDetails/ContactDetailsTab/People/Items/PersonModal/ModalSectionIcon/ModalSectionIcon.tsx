import React, { ReactNode } from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

const IconContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'transform',
})<{ transform?: string }>(({ transform, theme }) => ({
  display: 'flex',
  padding: 0,
  justifyContent: 'center',
  position: 'absolute',
  top: '50%',
  left: 8,
  transform: transform,
  color: theme.palette.mpdxGrayMedium.main,
  // Phones have a narrower icon gutter, and every icon centers on its row
  [theme.breakpoints.down('sm')]: {
    left: 0,
    transform: 'translateY(-50%)',
  },
}));

interface ModalSectionIconProps {
  icon: ReactNode;
  transform?: string;
}

export const ModalSectionIcon: React.FC<ModalSectionIconProps> = ({
  icon,
  transform = 'translateY(-50%)',
}) => {
  return <IconContainer transform={transform}>{icon}</IconContainer>;
};
