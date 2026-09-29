import React from 'react';
import Info from '@mui/icons-material/Info';
import { IconButton, Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useMpdSupervisorReport } from '../MpdSupervisorReportContext';

/** Header (i) button that opens the "How this report works" right panel. */
export const ReportLegendButton: React.FC = () => {
  const { t } = useTranslation();
  const { openLegend } = useMpdSupervisorReport();

  return (
    <Tooltip title={t('How this report works')}>
      <IconButton
        size="small"
        aria-label={t('How this report works')}
        onClick={openLegend}
      >
        <Info fontSize="small" sx={{ color: 'mpdxGrayDark.main' }} />
      </IconButton>
    </Tooltip>
  );
};
