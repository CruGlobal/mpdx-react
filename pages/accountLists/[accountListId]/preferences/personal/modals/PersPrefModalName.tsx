import React from 'react';
import { useTranslation } from 'react-i18next';
import { OutlinedInput, Unstable_Grid2 as Grid } from '@mui/material';
import { PersPrefFieldWrapper } from '../shared/PersPrefForms';
import { info } from '../DemoContent';

export const PersPrefModalName: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Grid container spacing={2} marginBottom={2}>
      {/* Title */}
      <Grid xs={12} sm={2}>
        <PersPrefFieldWrapper labelText={t('Title')}>
          <OutlinedInput value={info.title} />
        </PersPrefFieldWrapper>
      </Grid>

      {/* First name */}
      <Grid xs={12} sm={4}>
        <PersPrefFieldWrapper labelText={t('First Name')} required>
          <OutlinedInput value={info.first_name} />
        </PersPrefFieldWrapper>
      </Grid>

      {/* Last name */}
      <Grid xs={12} sm={4}>
        <PersPrefFieldWrapper labelText={t('Last Name')} required>
          <OutlinedInput value={info.last_name} />
        </PersPrefFieldWrapper>
      </Grid>

      {/* Suffix  */}
      <Grid xs={12} sm={2}>
        <PersPrefFieldWrapper labelText={t('Suffix')}>
          <OutlinedInput value={info.suffix} />
        </PersPrefFieldWrapper>
      </Grid>
    </Grid>
  );
};
