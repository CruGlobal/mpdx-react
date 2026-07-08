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
  /** Hides the row's bottom border. The last row never has a border. */
  hideBorder?: boolean;
}

export interface SupportNeedsTableProps {
  ariaLabel?: string;
  rows: SupportNeedsRow[];
}

/**
 * Renders rows with a title, optional description, and currency-formatted
 * amount for the goal presentation tables.
 */
export const SupportNeedsTable: React.FC<SupportNeedsTableProps> = ({
  ariaLabel,
  rows,
}) => {
  const locale = useLocale();

  return (
    <Box sx={{ width: '100%', overflowX: 'auto' }}>
      <Table size="small" aria-label={ariaLabel}>
        <TableBody>
          {rows.map(
            (
              {
                title,
                description,
                amount,
                amountBold = false,
                titleBold = true,
                hideBorder = false,
              },
              index,
              array,
            ) => (
              <TableRow
                key={title}
                sx={{
                  'td, th': {
                    borderBottom:
                      hideBorder || index === array.length - 1
                        ? 'none'
                        : '1px solid',
                    borderBottomColor: 'divider',
                  },
                }}
              >
                <TableCell component="th" scope="row">
                  <Typography
                    variant="body1"
                    fontWeight={titleBold ? 'bold' : 'normal'}
                  >
                    {title}
                  </Typography>
                  {description && (
                    <Typography
                      variant="body2"
                      color={theme.palette.text.secondary}
                      sx={{ mt: 1 }}
                    >
                      {description}
                    </Typography>
                  )}
                </TableCell>
                <TableCell sx={{ verticalAlign: 'top' }}>
                  <Typography
                    data-testid="amount-typography"
                    variant="body1"
                    fontWeight={amountBold ? 'bold' : 'normal'}
                  >
                    {currencyFormat(amount, 'USD', locale)}
                  </Typography>
                </TableCell>
              </TableRow>
            ),
          )}
        </TableBody>
      </Table>
    </Box>
  );
};
