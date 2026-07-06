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
  '.MuiTableCell-root': {
    paddingBlock: theme.spacing(1),
    verticalAlign: 'top',
    borderBottomColor: theme.palette.divider,
  },
  '.MuiTableCell-root.line': {
    width: theme.spacing(6),
    color: theme.palette.text.secondary,
  },
  '.MuiTableCell-root.amount': {
    textAlign: 'right',
    whiteSpace: 'nowrap',
  },
  '.MuiTableCell-root.bold': {
    fontWeight: 'bold',
  },
}));
