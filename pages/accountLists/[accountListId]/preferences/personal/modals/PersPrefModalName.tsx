import React from 'react';
import { useTranslation } from 'react-i18next';
import { Unstable_Grid2 as Grid } from '@mui/material';
import { PersPrefInput } from '../forms/PersPrefInput';
import { info } from '../DemoContent';

export const PersPrefModalName: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Grid container spacing={2} marginBottom={2}>
      {/* Title */}
      <Grid xs={12} sm={2}>
        <PersPrefInput label={t('Title')} value={info.title} />
      </Grid>

      {/* First name */}
      <Grid xs={12} sm={4}>
        <PersPrefInput
          label={t('First Name')}
          value={info.first_name}
          required
        />
      </Grid>

      {/* Last name */}
      <Grid xs={12} sm={4}>
        <PersPrefInput label={t('Last Name')} value={info.last_name} required />
      </Grid>

      {/* Suffix  */}
      <Grid xs={12} sm={2}>
        <PersPrefInput label={t('Suffix')} value={info.suffix} />
      </Grid>
    </Grid>
  );
};
