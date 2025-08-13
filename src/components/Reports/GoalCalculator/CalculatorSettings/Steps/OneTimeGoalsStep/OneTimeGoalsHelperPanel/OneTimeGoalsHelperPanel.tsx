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
          'To set a one-time savings goal, click "Add One-time Goal" to create a new row in the goal table. In the left cell of the new row, enter the name of your goal—for example, "Car." Then, in the right cell, enter the full dollar amount you need to raise, such as $15,000.',
        )}
      </Typography>
    </StyledHelperPanelBox>
  );
};
