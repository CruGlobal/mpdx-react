import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

export const PartTimeInfo: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Box sx={{ mt: 4, mb: 4, p: 3, border: '1px solid #ccc', borderRadius: 2 }}>
      <Typography variant="h5" gutterBottom>
        {t('Part-Time Staff Information')}
      </Typography>
      <Typography variant="body1">
        {t(
          'You are currently listed as part-time staff. Please contact your HR representative or supervisor for information about salary calculations and benefits for part-time staff.',
        )}
      </Typography>
    </Box>
  );
};
