import React from 'react';
import { BarChartOutlined, TableChart } from '@mui/icons-material';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { MonthlySummaryView } from '../MonthlySummary';

interface ToggleSummaryViewProps {
  selectedView: MonthlySummaryView;
  onChange: (
    event: React.MouseEvent<HTMLElement>,
    newView: MonthlySummaryView,
  ) => void;
}

export const ToggleSummaryView: React.FC<ToggleSummaryViewProps> = ({
  selectedView,
  onChange,
}) => {
  const { t } = useTranslation();

  return (
    <ToggleButtonGroup
      value={selectedView}
      exclusive
      onChange={onChange}
      size="small"
      aria-label={t('Select view')}
    >
      <ToggleButton
        value={MonthlySummaryView.Table}
        disabled={selectedView === MonthlySummaryView.Table}
      >
        <TableChart fontSize="small" titleAccess={t('Table view')} />
      </ToggleButton>
      <ToggleButton
        value={MonthlySummaryView.Chart}
        disabled={selectedView === MonthlySummaryView.Chart}
      >
        <BarChartOutlined fontSize="small" titleAccess={t('Chart view')} />
      </ToggleButton>
    </ToggleButtonGroup>
  );
};
