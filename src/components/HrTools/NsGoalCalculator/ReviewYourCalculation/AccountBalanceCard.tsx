import React from 'react';
import {
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { PresentationCard } from '../../Shared/GoalPresentation/PresentationCard';
import { NeedsTable } from './NeedsTable';

export interface AccountBalanceCardProps {
  /** Minimum staff account balance required before reporting to an assignment. */
  minAccountBalance: number;
  /** Column header naming the staff member (and spouse when married). */
  columnLabel: string;
}

/**
 * The "Min Staff Account Balance Upon Reporting" card on the Review Your
 * Calculation step, showing the minimum account balance a new staff member
 * must reach before reporting to their assignment.
 */
export const AccountBalanceCard: React.FC<AccountBalanceCardProps> = ({
  minAccountBalance,
  columnLabel,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

  return (
    <PresentationCard title={t('Min Staff Account Balance Upon Reporting')}>
      <NeedsTable size="small">
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
          <TableRow>
            <TableCell component="th" scope="row">
              <Typography variant="body1" fontWeight="bold">
                {t('Min Account Balance Needed to Report')}
              </Typography>
            </TableCell>
            <TableCell className="amount">
              <Typography variant="body1" fontWeight="bold">
                {currencyFormat(minAccountBalance, 'USD', locale, {
                  showTrailingZeros: true,
                })}
              </Typography>
            </TableCell>
          </TableRow>
        </TableBody>
      </NeedsTable>
    </PresentationCard>
  );
};
