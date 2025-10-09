import { TableRow } from '@mui/material';
import { styled } from '@mui/material/styles';

export const StyledRow = styled(TableRow)(() => ({
  '&:nth-of-type(odd)': {
    backgroundColor: '#E3F2FD',
  },
  '@media print': {
    '&:nth-of-type(odd)': {
      backgroundColor: '#E3F2FD !important',
      WebkitPrintColorAdjust: 'exact',
      printColorAdjust: 'exact',
    },
  },
}));
