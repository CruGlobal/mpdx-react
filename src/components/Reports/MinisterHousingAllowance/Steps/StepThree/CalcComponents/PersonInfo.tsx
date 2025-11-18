import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { mocks } from '../../../Shared/mockData';

export const PersonInfo: React.FC = () => {
  const { t } = useTranslation();
  const person = mocks[4].staffInfo;

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
        {t('Personal Contact Information')}
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography>{person.name}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography>{t(`Staff Account Number: ${person.id}`)}</Typography>
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography>{person.location.line1}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography>{t(`Email: ${person.email}`)}</Typography>
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography>{person.location.line2}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography>{t(`Phone number: ${person.phone}`)}</Typography>
        </Grid>
      </Grid>
    </Box>
  );
};
