import React from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/system';
import { useTranslation } from 'react-i18next';

const StyledHelperPanelBox = styled(Box)({
  padding: '16px',
});

export const SpecialInterestHelperPanel = () => {
  const { t } = useTranslation();
  return (
    <StyledHelperPanelBox>
      <Typography variant="body1">
        {t(
          'If you have income from outside sources (other than Cru) that you use as part of your budget, please include it below. Use "NET" numbers and not "Gross".',
        )}
      </Typography>
    </StyledHelperPanelBox>
  );
};
