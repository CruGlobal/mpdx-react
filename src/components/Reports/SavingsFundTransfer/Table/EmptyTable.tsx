import React from 'react';
import { HourglassDisabled } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

interface Props {
  title: string;
  subtitle: string;
}

const BoxWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.cruGrayLight.main,
  height: 300,
  minWidth: 700,
  maxWidth: '97%',
  margin: 'auto',
  padding: 4,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
}));

const StyledHourglassIcon = styled(HourglassDisabled)(({ theme }) => ({
  color: theme.palette.cruGrayDark.main,
}));

export const EmptyTable: React.FC<Props> = ({ title, subtitle }) => {
  const { t } = useTranslation();

  return (
    <BoxWrapper boxShadow={3}>
      <StyledHourglassIcon fontSize="large" />
      <Typography variant="h5">{t(title)}</Typography>
      <Typography>{t(subtitle)}</Typography>
      <Box sx={{ padding: 1, display: 'flex', gap: 2 }}></Box>
    </BoxWrapper>
  );
};
