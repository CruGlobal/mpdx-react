import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PresentationCard } from './PresentationCard';
import { SupportNeedsRow, SupportNeedsTable } from './SupportNeedsTable';
import { MonthlyNeeds, useMonthlyNeedsRows } from './useMonthlyNeedsRows';

export interface MonthlyNeedsCardProps {
  monthlyNeeds: MonthlyNeeds;
  supportRaised: number | null;
}

export const MonthlyNeedsCard: React.FC<MonthlyNeedsCardProps> = ({
  monthlyNeeds,
  supportRaised,
}) => {
  const { t } = useTranslation();

  const needsRows = useMonthlyNeedsRows(monthlyNeeds);

  const rows: SupportNeedsRow[] = useMemo(() => {
    return [
      ...needsRows,
      {
        title: t('Total Support Goal'),
        amount: monthlyNeeds.monthlyGoal,
        amountBold: true,
        hideBorder: true,
      },
      ...(supportRaised === null
        ? []
        : [
            {
              title: t('Total Solid Support'),
              amount: supportRaised,
              titleBold: false,
              hideBorder: true,
            },
          ]),
    ];
  }, [needsRows, supportRaised, t]);

  return (
    <PresentationCard title={t('Monthly Support Needs')}>
      <SupportNeedsTable rows={rows} ariaLabel={t('Monthly Support Needs')} />
    </PresentationCard>
  );
};
