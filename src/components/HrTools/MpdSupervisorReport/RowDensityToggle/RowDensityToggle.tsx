import React from 'react';
import ViewAgendaOutlined from '@mui/icons-material/ViewAgendaOutlined';
import ViewHeadlineOutlined from '@mui/icons-material/ViewHeadlineOutlined';
import { ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  RowDensityEnum,
  useMpdSupervisorReport,
} from '../MpdSupervisorReportContext';

/** Switches the staff rows between the comfortable and compact layouts. */
export const RowDensityToggle: React.FC = () => {
  const { t } = useTranslation();
  const { rowDensity, setRowDensity } = useMpdSupervisorReport();

  return (
    <ToggleButtonGroup
      value={rowDensity}
      exclusive
      size="small"
      aria-label={t('Row density')}
      onChange={(_event, value: RowDensityEnum | null) => {
        // Clicking the pressed button yields null; keep the current density
        if (value) {
          setRowDensity(value);
        }
      }}
    >
      <ToggleButton
        value={RowDensityEnum.Comfortable}
        aria-label={t('Comfortable rows')}
      >
        <Tooltip title={t('Comfortable rows')}>
          <ViewAgendaOutlined fontSize="small" />
        </Tooltip>
      </ToggleButton>
      <ToggleButton
        value={RowDensityEnum.Compact}
        aria-label={t('Compact rows')}
      >
        <Tooltip title={t('Compact rows')}>
          <ViewHeadlineOutlined fontSize="small" />
        </Tooltip>
      </ToggleButton>
    </ToggleButtonGroup>
  );
};
