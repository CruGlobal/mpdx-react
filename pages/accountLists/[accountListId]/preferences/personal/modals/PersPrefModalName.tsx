import React from 'react';
import { useTranslation } from 'react-i18next';
import { Grid, styled } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import { PersPrefField } from '../shared/PersPrefForms';
import { info } from '../DemoContent';

const StyledGridItem = styled(Grid)(({ theme }) => ({
  [theme.breakpoints.down('xs')]: {
    '&:not(:last-child) .MuiFormControl-root': {
      marginBottom: 0,
    },
  },
}));

export const PersPrefModalName: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Grid container spacing={2} style={{ marginBottom: theme.spacing(2) }}>
      <StyledGridItem item xs={12} sm={2}>
        <PersPrefField label={t('Title')} inputValue={info.title} />
      </StyledGridItem>
      <StyledGridItem item xs={12} sm={4}>
        <PersPrefField
          label={t('First Name')}
          inputValue={info.first_name}
          required
        />
      </StyledGridItem>
      <StyledGridItem item xs={12} sm={4}>
        <PersPrefField
          label={t('Last Name')}
          inputValue={info.last_name}
          required
        />
      </StyledGridItem>
      <StyledGridItem item xs={12} sm={2}>
        <PersPrefField label={t('Suffix')} inputValue={info.suffix} />
      </StyledGridItem>
    </Grid>
  );
};
