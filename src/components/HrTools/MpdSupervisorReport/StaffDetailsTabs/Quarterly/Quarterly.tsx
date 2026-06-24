import React from 'react';
import { Chip, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { useTranslation } from 'react-i18next';
import { useMpdSupervisorReport } from '../../MpdSupervisorReportContext';
import { healthColor } from '../../helpers';
import { QuarterStatus } from '../../mockData';

export const StaffTabQuarterly: React.FC = () => {
  const { t } = useTranslation();
  const { selectedMember } = useMpdSupervisorReport();

  if (!selectedMember) {
    return null;
  }

  const { quarters } = selectedMember;

  return (
    <>
      <Typography>{t('Fiscal Year Quarters')}</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
        <QuarterChips quarters={quarters} />
      </Box>
    </>
  );
};

interface QuarterChipsProps {
  quarters: QuarterStatus[];
}

const QuarterChips: React.FC<QuarterChipsProps> = ({ quarters }) => (
  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
    {quarters.map((quarter) => (
      <Chip
        key={quarter.label}
        label={quarter.label}
        size="small"
        sx={(theme) => {
          const { bg, color } = healthColor(theme, quarter.health);
          return {
            height: 22,
            fontWeight: 600,
            backgroundColor: bg,
            color,
            '& .MuiChip-label': {
              paddingInline: theme.spacing(1),
            },
          };
        }}
      />
    ))}
  </Box>
);
