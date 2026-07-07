import { Table, styled } from '@mui/material';

export interface NeedsRow {
  line: string;
  category: string;
  description?: string;
  amount: number;
  /** Bolds the entire row (totals and the final lines). */
  bold?: boolean;
}

export const NeedsTable = styled(Table)(({ theme }) => ({
  '.MuiTableRow-root.bold .MuiTypography-body1': {
    fontWeight: 'bold',
  },
  '.MuiTableCell-root': {
    paddingBlock: theme.spacing(1),
    verticalAlign: 'top',
    borderBottomColor: theme.palette.divider,
  },
  '.MuiTableCell-root.line': {
    width: theme.spacing(6),
  },
  '.MuiTableCell-root.amount': {
    textAlign: 'right',
    whiteSpace: 'nowrap',
  },
}));
