import React, { ReactNode } from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

interface ModalSectionContainerProps {
  children: ReactNode;
}

const ModalSectionWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(0, 6),
  margin: theme.spacing(2, 0),
  display: 'flex',
}));

export const ModalSectionContainer: React.FC<ModalSectionContainerProps> = ({
  children,
}) => {
  return <ModalSectionWrapper>{children}</ModalSectionWrapper>;
};
