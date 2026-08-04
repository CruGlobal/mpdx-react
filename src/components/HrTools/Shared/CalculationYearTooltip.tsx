import React from 'react';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import { IconButton, IconButtonProps, Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface CalculationYearTooltipProps {
  sx?: IconButtonProps['sx'];
}

/**
 * Info button explaining why the calculation year matters. Shared by the MPD
 * and New Staff goal calculators' calculation year pickers so the copy cannot
 * diverge.
 */
export const CalculationYearTooltip: React.FC<CalculationYearTooltipProps> = ({
  sx,
}) => {
  const { t } = useTranslation();

  return (
    <Tooltip
      title={t(
        'Benefits charges, geographic multipliers, base salary, and other constants change from year to year, which slightly increases most goals. Choose which year to calculate this goal with.',
      )}
    >
      <IconButton
        size="small"
        aria-label={t('About the calculation year')}
        sx={sx}
      >
        <InfoOutlined fontSize="small" />
      </IconButton>
    </Tooltip>
  );
};
