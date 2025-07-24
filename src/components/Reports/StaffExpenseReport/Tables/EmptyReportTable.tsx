import React from 'react';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

interface Props {
  title: string;
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

const StyledLocalAtmIcon = styled(LocalAtmIcon)(({ theme }) => ({
  color: theme.palette.cruGrayDark.main,
}));

export const EmptyReportTable: React.FC<Props> = ({ title }) => {
  const { t } = useTranslation();

  return (
    <BoxWrapper
      boxShadow={3}
      sx={{
        marginBottom: 4,
        borderRadius: 1,
        minWidth: { xs: '100%', sm: 600 },
        maxWidth: { xs: '100%', sm: '97%' },
        height: { xs: 200, sm: 300 },
      }}
    >
      <StyledLocalAtmIcon fontSize="large" />
      <Typography variant="h5">{t(title)}</Typography>
      <Typography>{t('No data to display for this time period.')}</Typography>
      <Box sx={{ padding: 1, display: 'flex', gap: 2 }}></Box>
    </BoxWrapper>
  );
};
