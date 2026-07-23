import React from 'react';
import {
  SxProps,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Theme,
  Typography,
  styled,
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { useFormatters } from '../../Shared/useFormatters';

export interface NeedsRow {
  line: string;
  category: string;
  description?: string;
  /** The line's dollar amount. */
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

export interface NeedsWorksheetTableProps {
  rows: NeedsRow[];
  /** Column header naming the staff member (and spouse when married). */
  columnLabel: string;
  /** Accessible name for the table. */
  ariaLabel: string;
}

/**
 * Renders a needs worksheet: a visually-hidden "Line" column, a category
 * column with an optional description sub-line, and a right-aligned,
 * currency-formatted amount column.
 */
export const NeedsWorksheetTable: React.FC<NeedsWorksheetTableProps> = ({
  rows,
  columnLabel,
  ariaLabel,
}) => {
  const { t } = useTranslation();
  const { formatCurrency } = useFormatters();

  return (
    <NeedsTable size="small" aria-label={ariaLabel}>
      <TableHead>
        <TableRow>
          <TableCell className="line">
            <Typography sx={visuallyHidden as SxProps<Theme>}>
              {t('Line')}
            </Typography>
          </TableCell>
          <TableCell>
            <Typography variant="body1" fontWeight="bold" color="primary">
              {t('Category')}
            </Typography>
          </TableCell>
          <TableCell className="amount">
            <Typography variant="body1" fontWeight="bold" color="primary">
              {columnLabel}
            </Typography>
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map(({ line, category, description, amount, bold }) => (
          <TableRow key={line} className={clsx({ bold })}>
            <TableCell className="line">
              <Typography>{line}</Typography>
            </TableCell>
            <TableCell component="th" scope="row">
              <Typography variant="body1">{category}</Typography>
              {description && (
                <Typography variant="body2" color="text.secondary">
                  {description}
                </Typography>
              )}
            </TableCell>
            <TableCell className={clsx('amount', { bold })}>
              <Typography variant="body1">{formatCurrency(amount)}</Typography>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </NeedsTable>
  );
};
