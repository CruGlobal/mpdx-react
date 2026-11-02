import React from 'react';
import { Box, Typography } from '@mui/material';
import { SxProps, Theme, useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { healthColor } from '../helpers';
import { healthStatusLabel, healthStatusOrder } from './legendCopy';

interface HealthColorKeyProps {
  sx?: SxProps<Theme>;
}

/**
 * The always-visible one-line key to the chip colours, shown beside the
 * quarter column headers. The full explanation lives in ReportLegendPopover.
 */
export const HealthColorKey: React.FC<HealthColorKeyProps> = ({ sx }) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Box
      component="ul"
      aria-label={t('Chip colors')}
      sx={[
        {
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 2,
          m: 0,
          p: 0,
          listStyle: 'none',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {healthStatusOrder.map((status) => {
        const { bg, color } = healthColor(theme, status);
        return (
          <Box
            key={status}
            component="li"
            sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}
          >
            <Box
              aria-hidden
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                bgcolor: bg,
                border: `1.5px solid ${color}`,
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {healthStatusLabel(t, status)}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
};
