import React from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/system';
import { useTranslation } from 'react-i18next';

const StyledHelperPanelBox = styled(Box)({
  padding: '16px',
});

export const OneTimeGoalsHelperPanel = () => {
  const { t } = useTranslation();
  return (
    <StyledHelperPanelBox>
      <Typography variant="body1">
        {t(
          'If you need to raise money for a one time goal, please enter the full dollar amount below. Example: type "Car" in the yellow cell and put 15,000 in the blue cell.',
        )}
      </Typography>
    </StyledHelperPanelBox>
  );
};
