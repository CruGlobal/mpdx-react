import React from 'react';
import { Chip } from '@mui/material';
import { styled } from '@mui/material/styles';

// 85% of a small Chip, so it sits quietly beside the row's description
const StyledChip = styled(Chip)(({ theme }) => ({
  flexShrink: 0,
  height: 20.4,
  fontSize: theme.typography.pxToRem(11),
  '.MuiChip-label': {
    padding: theme.spacing(0, 0.85),
  },
}));

interface PendingChipProps {
  label: string;
}

export const PendingChip: React.FC<PendingChipProps> = ({ label }) => (
  <StyledChip label={label} size="small" color="warning" variant="outlined" />
);
