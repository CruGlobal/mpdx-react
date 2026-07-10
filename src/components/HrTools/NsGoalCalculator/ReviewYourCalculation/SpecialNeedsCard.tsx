import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { numberFormat } from 'src/lib/intlFormat';
import { PresentationCard } from '../../Shared/GoalPresentation/PresentationCard';
import { NeedsRow, NeedsWorksheetTable } from './NeedsTable';

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
 * TODO(MPDX-9801): Special needs data is not available yet, so every amount
 * renders as "—" (not-yet-available) rather than a real-looking `$0.00`. Wire
 * these lines up to the server-computed values once the special-needs
 * calculations land.
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
      amount: null,
    },
    {
      line: '2',
      category: t('Faith & Finances Course'),
      amount: null,
    },
    {
      line: '3',
      category: t('Refresh Retreat'),
      description: t('Includes travel'),
      amount: null,
    },
    {
      line: '4',
      category: t('Cru National Conference'),
      amount: null,
    },
    {
      line: '5',
      category: t('Subtotal'),
      description: t('Add lines 1-4'),
      amount: null,
    },
    {
      line: '6',
      category: t('Subtotal with Admin Assessment'),
      description: t('Divide line 5 by {{divisor}}', {
        divisor: adminDivisor,
      }),
      amount: null,
      bold: true,
    },
    {
      line: '7',
      category: t('Special Needs Developed to Date'),
      description: t(
        'This amount comes from what you inputted on the MPD Questionnaire.',
      ),
      amount: null,
      bold: true,
    },
    {
      line: '8',
      category: t('Special Needs to be Developed'),
      description: t('Subtract line 7 from line 6'),
      amount: null,
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
