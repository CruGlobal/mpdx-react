import React from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import theme from 'src/theme';

export interface SupportNeedsRow {
  title: string;
  description?: string;
  amount: number;
  /** Bolds the amount cell. Defaults to false (amounts are normal weight). */
  amountBold?: boolean;
  /** Bolds the title cell. Defaults to true (titles are bold). */
  titleBold?: boolean;
}

export interface SupportNeedsTableProps {
  rows: SupportNeedsRow[];
}

/**
 * Renders rows with a title, optional description, and currency-formatted
 * amount for the goal presentation tables.
 */
export const SupportNeedsTable: React.FC<SupportNeedsTableProps> = ({
  rows,
}) => {
  const locale = useLocale();

  return (
    <Box sx={{ width: '100%', overflowX: 'auto' }}>
      <Table size="small">
        <TableBody>
          {rows.map((item, index, array) => (
            <TableRow
              key={item.title}
              sx={{
                'td, th': {
                  borderBottom: index < array.length - 1 ? '1px solid' : 'none',
                  borderBottomColor: 'divider',
                },
              }}
            >
              <TableCell component="th" scope="row">
                <Typography
                  variant="body1"
                  fontWeight={item.titleBold === false ? 'normal' : 'bold'}
                >
                  {item.title}
                </Typography>
                {item.description && (
                  <Typography
                    variant="body2"
                    color={theme.palette.text.secondary}
                    sx={{ mt: 1 }}
                  >
                    {item.description}
                  </Typography>
                )}
              </TableCell>
              <TableCell sx={{ verticalAlign: 'top' }}>
                <Typography
                  data-testid="amount-typography"
                  variant="body1"
                  fontWeight={item.amountBold ? 'bold' : 'normal'}
                >
                  {currencyFormat(item.amount, 'USD', locale)}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};
