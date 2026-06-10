import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SupportNeedsRow, SupportNeedsTable } from './SupportNeedsTable';

interface SpecialNeedsTableProps {
  specialNeeds: number;
}

/**
 * Special needs table shown on the new staff goal presentation page.
 */
export const SpecialNeedsTable: React.FC<SpecialNeedsTableProps> = ({
  specialNeeds,
}) => {
  const { t } = useTranslation();

  const rows: SupportNeedsRow[] = useMemo(
    () => [
      {
        title: t('Total Special Needs Goal'),
        description: t(
          'NSO/IBS Tuition, housing, food, travel, MPD Refresh Retreat, Faith & Finance Course.',
        ),
        amount: specialNeeds,
      },
    ],
    [specialNeeds, t],
  );

  return <SupportNeedsTable rows={rows} />;
};
