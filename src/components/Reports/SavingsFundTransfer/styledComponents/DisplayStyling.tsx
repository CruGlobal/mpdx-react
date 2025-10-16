import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

export const PrintOnly = styled(Box)({
  display: 'none',
  '@media print': {
    display: 'block',
  },
});

export const ScreenOnly = styled(Box)({
  '@media print': {
    display: 'none',
  },
});
