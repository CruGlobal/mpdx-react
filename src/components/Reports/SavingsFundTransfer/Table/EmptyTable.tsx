import React from 'react';
import { HourglassDisabled } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { EmptyTableWrapper } from 'src/components/Shared/styledComponents/EmptyTableWrapper';

interface Props {
  title: string;
  subtitle: string;
}

const StyledHourglassIcon = styled(HourglassDisabled)(({ theme }) => ({
  color: theme.palette.cruGrayDark.main,
}));

export const EmptyTable: React.FC<Props> = ({ title, subtitle }) => {
  const { t } = useTranslation();

  return (
    <EmptyTableWrapper boxShadow={3}>
      <StyledHourglassIcon fontSize="large" />
      <Typography variant="h5">{t(title)}</Typography>
      <Typography>{t(subtitle)}</Typography>
      <Box sx={{ padding: 1, display: 'flex', gap: 2 }}></Box>
    </EmptyTableWrapper>
  );
};
