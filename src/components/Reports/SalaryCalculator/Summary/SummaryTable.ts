import { Table, styled } from '@mui/material';

export const SummaryTable = styled(Table)(({ theme }) => ({
  '.MuiTableCell-root': {
    '&:not(:first-child)': {
      textAlign: 'right',
    },

    '&.sub-item': {
      paddingLeft: theme.spacing(4),
    },

    '.explanation': {
      display: 'block',
      color: theme.palette.text.secondary,
      marginTop: theme.spacing(0.5),
    },
  },
}));
