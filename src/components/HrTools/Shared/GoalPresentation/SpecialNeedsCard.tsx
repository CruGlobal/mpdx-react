import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PresentationCard } from './PresentationCard';
import { SupportNeedsRow, SupportNeedsTable } from './SupportNeedsTable';

interface SpecialNeedsCardProps {
  specialNeeds: number;
}

/**
 * Special needs card shown on the new staff goal presentation page.
 */
export const SpecialNeedsCard: React.FC<SpecialNeedsCardProps> = ({
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

  return (
    <PresentationCard title={t('Special Needs')}>
      <SupportNeedsTable rows={rows} />
    </PresentationCard>
  );
};
