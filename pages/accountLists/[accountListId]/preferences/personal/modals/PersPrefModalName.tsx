import React from 'react';
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
  const theme = useTheme();

  return (
    <Grid container spacing={2} style={{ marginBottom: theme.spacing(2) }}>
      <StyledGridItem item xs={12} sm={2}>
        <PersPrefField label="Title" inputValue={info.title} />
      </StyledGridItem>
      <StyledGridItem item xs={12} sm={4}>
        <PersPrefField
          label="First Name"
          inputValue={info.first_name}
          required
        />
      </StyledGridItem>
      <StyledGridItem item xs={12} sm={4}>
        <PersPrefField label="Last Name" inputValue={info.last_name} required />
      </StyledGridItem>
      <StyledGridItem item xs={12} sm={2}>
        <PersPrefField label="Suffix" inputValue={info.suffix} />
      </StyledGridItem>
    </Grid>
  );
};
