import { Email, Smartphone, Task } from '@mui/icons-material';
import { Box, TableCell, TableRow } from '@mui/material';
import { styled } from '@mui/material/styles';

export const StyledTableHeadCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
}));

export const StyledTableHeadSelectCell = styled(TableCell)(() => ({
  cursor: 'pointer',
  fontSize: 14,
  paddingTop: 8,
  paddingBottom: 8,
  top: 88,
}));

export const StyledTableCell = styled(TableCell)(() => ({
  fontSize: 14,
  paddingTop: 8,
  paddingBottom: 8,
}));

export const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

export const StyledSmartphone = styled(Smartphone)(() => ({
  marginRight: '8px',
}));
export const StyledEmail = styled(Email)(() => ({
  marginRight: '6px',
}));
export const StyledTask = styled(Task)(() => ({
  marginRight: '3px',
}));

export const SelectAllBox = styled(Box)(() => ({
  width: 120,
  margin: '0 0 0 auto',
}));
