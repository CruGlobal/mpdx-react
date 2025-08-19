import React from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/system';
import { useTranslation } from 'react-i18next';

const StyledNoticeTypography = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(2),
  color: theme.palette.error.main,
  fontStyle: 'italic',
}));
const StyledHelperPanelBox = styled(Box)({
  padding: '16px',
});

export const SpouseIncomeHelperPanel = () => {
  const { t } = useTranslation();
  return (
    <StyledHelperPanelBox>
      <StyledNoticeTypography variant="body2">
        {t(
          "The amount entered here will be reflected in your total MPD goal. To look at your goal without spouse's salary, leave this blank.",
        )}
      </StyledNoticeTypography>
    </StyledHelperPanelBox>
  );
};
