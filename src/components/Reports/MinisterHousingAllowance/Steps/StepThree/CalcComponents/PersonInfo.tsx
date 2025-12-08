import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useMinisterHousingAllowance } from '../../../Shared/Context/MinisterHousingAllowanceContext';

export const PersonInfo: React.FC = () => {
  const { t } = useTranslation();

  const { userHcmData } = useMinisterHousingAllowance();
  const person = userHcmData?.staffInfo;

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: 18 }}>
        {t('Personal Contact Information')}
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography>
            {person?.preferredName} {person?.lastName}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography>
            {t(`Staff Account Number: ${person?.personNumber}`)}
          </Typography>
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          {person?.addressLine2 === null ? (
            <Typography>{person?.addressLine1}</Typography>
          ) : (
            <Typography>
              {person?.addressLine1}, {person?.addressLine2}
            </Typography>
          )}
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography>{t(`Email: ${person?.emailAddress}`)}</Typography>
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography>
            {person?.city}, {person?.state} {person?.zipCode}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography>
            {t(`Phone number: ${person?.primaryPhoneNumber}`)}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};
