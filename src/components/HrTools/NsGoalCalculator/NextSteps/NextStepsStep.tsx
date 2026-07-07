import React from 'react';
import { Box, Typography } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';

export const NextStepsStep: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      <Typography variant="h6">{t('Next Steps')}</Typography>

      <Typography variant="body1">
        {t('Great job completing the MPD Goal Calculation process!')}
      </Typography>

      <Typography variant="body1">
        <Trans t={t}>
          You can return to this New Staff Goal Calculation under HR Tools in
          your top navigation at any time. If you have any questions or need to
          make changes to your goal, please contact your coach.
        </Trans>
      </Typography>
    </Box>
  );
};
