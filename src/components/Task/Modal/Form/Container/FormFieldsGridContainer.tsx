import React, { ReactNode } from 'react';
import { Grid } from '@mui/material';

interface FormFieldsGridContainerPros {
  children: ReactNode;
}

export const FormFieldsGridContainer: React.FC<FormFieldsGridContainerPros> = ({
  children,
}) => {
  return (
    <Grid container direction="column" spacing={2} style={{ width: '75%' }}>
      {children}
    </Grid>
  );
};
