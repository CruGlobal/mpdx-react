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
    const totalSupportGoal = needsRows.reduce(
      (sum, row) => sum + row.amount,
      0,
    );

    return [
      ...needsRows,
      {
        title: t('Total Support Goal'),
        amount: totalSupportGoal,
        bold: true,
      },
      ...(supportRaised === null
        ? []
        : [
            {
              title: t('Total Solid Support'),
              amount: supportRaised,
              titleBold: false,
            },
          ]),
    ];
  }, [needsRows, supportRaised, t]);

  return (
    <PresentationCard title={t('Monthly Support Needs')}>
      <SupportNeedsTable rows={rows} />
    </PresentationCard>
  );
};
