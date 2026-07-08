import React, { useMemo } from 'react';
import {
  Box,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import {
  currencyFormat,
  numberFormat,
  percentageFormat,
} from 'src/lib/intlFormat';
import { PresentationCard } from '../../Shared/GoalPresentation/PresentationCard';
import { NsGoalCalculation } from '../Shared/NsGoalCalculatorContext';
import { NeedsRow, NeedsTable } from './NeedsTable';

type Calculations = NsGoalCalculation['calculations'];

export interface MonthlyNeedsCardProps {
  calculations: Calculations;
  /** Line 17. Solid monthly support already developed. */
  supportRaised: number;
  /** Column header naming the staff member (and spouse when married). */
  columnLabel: string;
}

/**
 * The "Monthly Needs" card on the Review Your Calculation step, containing the
 * 18-line needs worksheet. Every line comes straight from the server-computed
 * `calculations` object except line 18, which subtracts the support already
 * raised from the total goal.
 */
export const MonthlyNeedsCard: React.FC<MonthlyNeedsCardProps> = ({
  calculations,
  supportRaised,
  columnLabel,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

  const rows = useMemo((): NeedsRow[] => {
    const secaMultiplier = numberFormat(calculations.secaRate, locale);
    const adminDivisor = numberFormat(1 - calculations.adminRate, locale);
    const attritionFactor = numberFormat(
      1 + calculations.attritionRate,
      locale,
    );

    return [
      {
        line: '1A',
        category: t('Salary'),
        description: t('Taxes will be deducted from this amount'),
        amount: calculations.salary,
      },
      {
        line: '1B',
        category: t('SECA, other taxes'),
        description: t('Line 1A x {{multiplier}}', {
          multiplier: secaMultiplier,
        }),
        amount: calculations.seca,
      },
      {
        line: '1C',
        category: t('Subtotal Salary'),
        description: t('Add lines 1A-B'),
        amount: calculations.salarySubtotal,
      },
      {
        line: '1D',
        category: t('403(b) Voluntary Retirement Plan'),
        amount: calculations.totalContributing403bAmount,
      },
      {
        line: '1',
        category: t('Total Salary'),
        description: t('Add lines 1C-D'),
        amount: calculations.totalSalary,
        bold: true,
      },
      {
        line: '2',
        category: t('Ministry Miles'),
        description: t('Current mileage rate x # of ministry miles'),
        amount: calculations.ministryMiles,
      },
      {
        line: '3',
        category: t('Travel'),
        description: t('MPD and miscellaneous'),
        amount: calculations.travel,
      },
      {
        line: '4',
        category: t('Meetings, Retreats, Conferences'),
        description: t('Cru only: registration, tuition, etc.'),
        amount: calculations.conferences,
      },
      {
        line: '5',
        category: t('Meals and Per Diem'),
        description: t('Ministry related only'),
        amount: calculations.meals,
      },
      {
        line: '6',
        category: t('MPD'),
        description: t('Printing, stationery, postage, phone, gifts, etc.'),
        amount: calculations.mpd,
      },
      {
        line: '7',
        category: t('Supplies and Materials (ministry purposes only)'),
        description: t('Ministry purposes only'),
        amount: calculations.supplies,
      },
      {
        line: '8',
        category: t('Summer Expenses'),
        description: t('Summer assignments, U.S. Staff Conf'),
        amount: calculations.staffConferenceTransfer,
      },
      {
        line: '9',
        category: t('Benefits'),
        amount: calculations.benefitsCharge,
      },
      {
        line: '10',
        category: t('Reimbursable Medical Expenses'),
        description: t('Deductible and non-covered medical expenses'),
        amount: calculations.medicalExpenses,
      },
      {
        line: '11',
        category: t('Transfers to other staff, EMAF, etc.'),
        amount: calculations.accountTransfers,
      },
      {
        line: '12',
        category: t('Advocacy (optional)'),
        amount: calculations.advocacyTransfers,
      },
      {
        line: '13',
        category: t('Other'),
        amount: calculations.otherExpenses,
      },
      {
        line: '14',
        category: t('Subtotal'),
        description: t('Add lines 1-13'),
        amount: calculations.goalSubtotal,
      },
      {
        line: '15',
        category: t('Subtotal for {{admin}} Admin charge', {
          admin: percentageFormat(calculations.adminRate, locale, {
            fractionDigits: 0,
          }),
        }),
        description: t('Divide line 14 by {{divisor}}', {
          divisor: adminDivisor,
        }),
        amount: calculations.subtotalWithAdminCharge,
      },
      {
        line: '16',
        category: t('Total Goal'),
        description: t('Line 15 x {{factor}} attrition factor', {
          factor: attritionFactor,
        }),
        amount: calculations.monthlyGoal,
        bold: true,
      },
      {
        line: '17',
        category: t('Solid Monthly Support Developed'),
        amount: supportRaised,
      },
      {
        line: '18',
        category: t('Monthly Support to be Developed'),
        description: t('Subtract line 17 from line 16'),
        amount: calculations.monthlyGoal - supportRaised,
        bold: true,
      },
    ];
  }, [t, locale, calculations, supportRaised]);

  return (
    <PresentationCard title={t('Monthly Needs')}>
      <Box sx={{ width: '100%', overflowX: 'auto' }}>
        <NeedsTable size="small">
          <TableHead>
            <TableRow>
              <TableCell className="line">
                <Typography sx={visuallyHidden}>{t('Line')}</Typography>
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
