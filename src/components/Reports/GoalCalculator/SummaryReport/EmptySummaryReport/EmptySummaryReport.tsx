import React from 'react';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

const BoxWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.cruGrayLight.main,
  minWidth: 700,
  maxWidth: '97%',
  height: '100%',
  margin: 'auto',
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
}));

const StyledInfoIcon = styled(InfoOutlinedIcon)(({ theme }) => ({
  color: theme.palette.cruGrayDark.main,
}));

export const EmptySummaryReport: React.FC = () => {
  const { t } = useTranslation();

  return (
    <BoxWrapper boxShadow={3}>
      <StyledInfoIcon fontSize="large" />
      <Typography variant="h5">{t('No Summary Report Available')}</Typography>
      <Typography>
        {t(
          'There is no summary report data to display. Please check your goal calculation or add data to view your summary report.',
        )}
      </Typography>
    </BoxWrapper>
  );
};
