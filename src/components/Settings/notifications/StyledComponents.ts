import { Email, Smartphone, Task } from '@mui/icons-material';
import { Box, TableCell, TableRow } from '@mui/material';
import { Theme, styled } from '@mui/material/styles';

// Tighten the checkbox columns on phones so the table fits without scrolling
const narrowCheckboxColumns = (theme: Theme) => ({
  [theme.breakpoints.down('sm')]: {
    '&:not(:first-child)': {
      paddingLeft: theme.spacing(0.5),
      paddingRight: theme.spacing(0.5),
    },
  },
});

export const StyledTableHeadCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  ...narrowCheckboxColumns(theme),
}));

export const StyledTableHeadSelectCell = styled(TableCell)(({ theme }) => ({
  cursor: 'pointer',
  fontSize: 14,
  paddingTop: 8,
  paddingBottom: 8,
  top: 88,
  ...narrowCheckboxColumns(theme),
}));

export const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontSize: 14,
  paddingTop: 8,
  paddingBottom: 8,
  ...narrowCheckboxColumns(theme),
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

export const SelectAllBox = styled(Box)(({ theme }) => ({
  margin: '0 0 0 auto',
  [theme.breakpoints.up('sm')]: {
    width: 120,
  },
}));
