import React from 'react';
import {
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { PresentationCard } from '../../Shared/GoalPresentation/PresentationCard';
import { useFormatters } from '../../Shared/useFormatters';
import { NeedsTable } from './NeedsTable';

export interface AccountBalanceCardProps {
  /** Minimum staff account balance required before reporting to an assignment. */
  minAccountBalance: number;
  /** Column header naming the staff member (and spouse when married). */
  columnLabel: string;
}

/**
 * The "Minimum Staff Account Balance" card on the Review Your
 * Calculation step, showing the minimum account balance a new staff member
 * must reach before reporting to their assignment.
 */
export const AccountBalanceCard: React.FC<AccountBalanceCardProps> = ({
  minAccountBalance,
  columnLabel,
}) => {
  const { t } = useTranslation();
  const { formatCurrency } = useFormatters();

  return (
    <PresentationCard title={t('Minimum Staff Account Balance')}>
      <NeedsTable size="small" aria-label={t('Minimum Staff Account Balance')}>
        <TableHead>
          <TableRow>
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
          <TableRow className="bold">
            <TableCell component="th" scope="row">
              <Typography variant="body1">
                {t('Minimum Account Balance Needed to Report')}
              </Typography>
            </TableCell>
            <TableCell className="amount">
              <Typography variant="body1">
                {formatCurrency(minAccountBalance)}
              </Typography>
            </TableCell>
          </TableRow>
        </TableBody>
      </NeedsTable>
    </PresentationCard>
  );
};
