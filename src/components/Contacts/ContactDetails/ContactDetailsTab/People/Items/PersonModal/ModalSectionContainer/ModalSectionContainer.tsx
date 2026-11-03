import React, { ReactNode } from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { modalSectionDeleteIconClass } from '../ModalSectionDeleteIcon/ModalSectionDeleteIcon';

interface ModalSectionContainerProps {
  children: ReactNode;
}

const ModalSectionWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(0, 6),
  margin: theme.spacing(2, 0),
  display: 'flex',
  // MUI v7 Grid (v2) containers no longer stretch to fill a flex-row parent
  // the way v5's Grid did — they shrink to content width, squeezing the
  // columns (e.g. the phone/email "Type" select truncating to "M…"). Let the
  // Grid rows grow to fill the remaining width beside any section icon.
  '> .MuiGrid-container': {
    flexGrow: 1,
    minWidth: 0,
  },
  // Phones use narrower, equal gutters so the fields stay wide and centered,
  // and the delete button moves down beside the item's last row instead.
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(0, 4),
    [`& .${modalSectionDeleteIconClass}`]: {
      top: 'auto',
      bottom: 0,
      transform: 'none',
    },
  },
}));

export const ModalSectionContainer: React.FC<ModalSectionContainerProps> = ({
  children,
}) => {
  return <ModalSectionWrapper>{children}</ModalSectionWrapper>;
};
