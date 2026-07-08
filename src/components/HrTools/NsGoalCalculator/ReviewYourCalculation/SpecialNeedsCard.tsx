import React from 'react';
import {
  Box,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat, numberFormat } from 'src/lib/intlFormat';
import { PresentationCard } from '../../Shared/GoalPresentation/PresentationCard';
import { NeedsRow, NeedsTable } from './NeedsTable';

export interface SpecialNeedsCardProps {
  /** Column header naming the staff member (and spouse when married). */
  columnLabel: string;
  /** Admin charge rate; line 6 divides the subtotal by `1 - adminRate`. */
  adminRate: number;
}

/**
 * The "Special Needs During MPD" card on the Review Your Calculation step,
 * listing one-time special-needs expenses.
 *
 * TODO(MPDX-9801): Special needs data is not available yet, so every amount is
 * mocked to 0. Wire these lines up to the server-computed values once the
 * special-needs calculations land.
 */
export const SpecialNeedsCard: React.FC<SpecialNeedsCardProps> = ({
  columnLabel,
  adminRate,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

  const adminDivisor = numberFormat(1 - adminRate, locale);

  const rows: NeedsRow[] = [
    {
      line: '1',
      category: t('IBS / NSO'),
      description: t('Tuition, Books, Housing, Food, Travel Expenses'),
      amount: 0,
    },
    {
      line: '2',
      category: t('Faith & Finances Course'),
      amount: 0,
    },
    {
      line: '3',
      category: t('Refresh Retreat'),
      description: t('Includes travel'),
      amount: 0,
    },
    {
      line: '4',
      category: t('Cru National Conference'),
      amount: 0,
    },
    {
      line: '5',
      category: t('Subtotal'),
      description: t('Add lines 1-4'),
      amount: 0,
    },
    {
      line: '6',
      category: t('Subtotal with Admin Assessment'),
      description: t('Divide line 5 by {{divisor}}', {
        divisor: adminDivisor,
      }),
      amount: 0,
      bold: true,
    },
    {
      line: '7',
      category: t('Special Needs Developed to Date'),
      description: t(
        'This amount comes from what you inputted on the MPD Questionnaire.',
      ),
      amount: 0,
      bold: true,
    },
    {
      line: '8',
      category: t('Special Needs to be Developed'),
      description: t('Subtract line 7 from line 6'),
      amount: 0,
      bold: true,
    },
  ];

  return (
    <PresentationCard title={t('Special Needs During MPD')}>
      <Box sx={{ width: '100%', overflowX: 'auto' }}>
        <NeedsTable size="small">
          <TableHead>
            <TableRow>
              <TableCell className="line" />
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
                  <Typography variant="body1">
                    {currencyFormat(amount, 'USD', locale, {
                      showTrailingZeros: true,
                    })}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </NeedsTable>
      </Box>
    </PresentationCard>
  );
};
