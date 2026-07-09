import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { numberFormat, percentageFormat } from 'src/lib/intlFormat';
import { PresentationCard } from '../../Shared/GoalPresentation/PresentationCard';
import { NsGoalCalculation } from '../Shared/NsGoalCalculatorContext';
import { NeedsRow, NeedsWorksheetTable } from './NeedsTable';

type Calculations = NsGoalCalculation['calculations'];

export interface MonthlyNeedsCardProps {
  calculations: Calculations;
  /** Column header naming the staff member (and spouse when married). */
  columnLabel: string;
}

/**
 * The "Monthly Needs" card on the Review Your Calculation step, containing the
 * 18-line needs worksheet.
 */
export const MonthlyNeedsCard: React.FC<MonthlyNeedsCardProps> = ({
  calculations,
  columnLabel,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

  const rows = useMemo((): NeedsRow[] => {
    const supportRaised = calculations.supportRaised ?? 0;
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
  }, [t, locale, calculations]);

  const title = t('Monthly Needs');

  return (
    <PresentationCard title={title}>
      <NeedsWorksheetTable
        rows={rows}
        columnLabel={columnLabel}
        ariaLabel={title}
      />
    </PresentationCard>
  );
};
