import React from 'react';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useMpdSupervisorReport } from '../MpdSupervisorReportContext';

/** Header button that opens the "How this report works" right panel. */
export const ReportLegendButton: React.FC = () => {
  const { t } = useTranslation();
  const { openLegend } = useMpdSupervisorReport();

  return (
    <Button
      variant="outlined"
      size="small"
      startIcon={<InfoOutlined />}
      onClick={openLegend}
      sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}
    >
      {t('How this report works')}
    </Button>
  );
};
