import { TableCell } from '@mui/material';
import { styled } from '@mui/material/styles';

export const StyledTableCell = styled(TableCell)(({}) => ({
  '@media print': {
    padding: '4px',
  },
}));
