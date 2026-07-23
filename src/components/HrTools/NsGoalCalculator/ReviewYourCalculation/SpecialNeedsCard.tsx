import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { numberFormat } from 'src/lib/intlFormat';
import { PresentationCard } from '../../Shared/GoalPresentation/PresentationCard';
import { NsGoalCalculation } from '../Shared/NsGoalCalculatorContext';
import { useSpecialNeedsCategories } from '../Shared/useSpecialNeedsCategories';
import { NeedsRow, NeedsWorksheetTable } from './NeedsTable';

type Calculations = NsGoalCalculation['calculations'];

export interface SpecialNeedsCardProps {
  /** Column header naming the staff member (and spouse when married). */
  columnLabel: string;
  /** Server-computed special-needs worksheet figures. */
  calculations: Calculations;
}

/**
 * The "Special Needs During MPD" card on the Review Your Calculation step,
 * listing the one-time special-needs expenses. Every amount is computed
 * server-side from the attendee's cohort costs.
 */
export const SpecialNeedsCard: React.FC<SpecialNeedsCardProps> = ({
  columnLabel,
  calculations,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

  const adminDivisor = numberFormat(1 - calculations.adminRate, locale);
  const categories = useSpecialNeedsCategories(calculations);

  const rows: NeedsRow[] = [
    ...categories.map(({ title, description, amount }, index) => ({
      line: String(index + 1),
      category: title,
      description,
      amount,
    })),
    {
      line: '5',
      category: t('Subtotal'),
      description: t('Add lines 1-4'),
      amount: calculations.specialNeedsSubtotal,
    },
    {
      line: '6',
      category: t('Subtotal with Admin Assessment'),
      description: t('Divide line 5 by {{divisor}}', {
        divisor: adminDivisor,
      }),
      amount: calculations.specialNeedsTotal,
      bold: true,
    },
    {
      line: '7',
      category: t('Special Needs Developed to Date'),
      description: t(
        'This amount comes from what you inputted on the MPD Questionnaire.',
      ),
      amount: calculations.specialNeedsDevelopedToDate,
      bold: true,
    },
    {
      line: '8',
      category: t('Special Needs to be Developed'),
      description: t('Subtract line 7 from line 6'),
      amount: calculations.specialNeedsLeft,
      bold: true,
    },
  ];

  const title = t('Special Needs During MPD');

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
