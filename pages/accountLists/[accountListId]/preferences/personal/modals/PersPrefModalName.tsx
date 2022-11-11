import React from 'react';
import { useTranslation } from 'react-i18next';
import { OutlinedInput, Unstable_Grid2 as Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import { PersPrefFieldWrapper } from '../shared/PersPrefForms';
import { info } from '../DemoContent';

const StyledGridItem = styled(Grid)(({ theme }) => ({
  [theme.breakpoints.down('xs')]: {
    '&:not(:last-child) .MuiFormControl-root': {
      marginBottom: 0,
    },
  },
}));

const StyledGrid = styled(Grid)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

export const PersPrefModalName: React.FC = () => {
  const { t } = useTranslation();

  return (
    <StyledGrid container spacing={2}>
      {/* Title */}
      <StyledGridItem xs={12} sm={2}>
        <PersPrefFieldWrapper labelText={t('Title')}>
          <OutlinedInput value={info.title} />
        </PersPrefFieldWrapper>
      </StyledGridItem>

      {/* First name */}
      <StyledGridItem xs={12} sm={4}>
        <PersPrefFieldWrapper labelText={t('First Name')} required>
          <OutlinedInput value={info.first_name} />
        </PersPrefFieldWrapper>
      </StyledGridItem>

      {/* Last name */}
      <StyledGridItem xs={12} sm={4}>
        <PersPrefFieldWrapper labelText={t('Last Name')} required>
          <OutlinedInput value={info.last_name} />
        </PersPrefFieldWrapper>
      </StyledGridItem>

      {/* Suffix  */}
      <StyledGridItem xs={12} sm={2}>
        <PersPrefFieldWrapper labelText={t('Suffix')}>
          <OutlinedInput value={info.suffix} />
        </PersPrefFieldWrapper>
      </StyledGridItem>
    </StyledGrid>
  );
};
