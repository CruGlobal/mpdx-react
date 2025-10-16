import React from 'react';
import { Box, Link, Typography } from '@mui/material';
import { styled } from '@mui/system';
import { useTranslation } from 'react-i18next';

const StyledHelperPanelBox = styled(Box)({
  padding: '16px',
});

export const BenefitsPlanHelperPanel = () => {
  const { t } = useTranslation();
  return (
    <StyledHelperPanelBox>
      <Typography variant="body2">
        <Link
          href="https://drive.google.com/file/d/1DfQtbRJ-ET02dWjizaIpqGQzoqOVWp2e/view"
          target="_blank"
          rel="noopener noreferrer"
          underline="always"
        >
          {t('View detailed instructions')}
        </Link>
      </Typography>
    </StyledHelperPanelBox>
  );
};
