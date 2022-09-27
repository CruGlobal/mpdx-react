import React, { ReactNode } from 'react';
import { Grid, useMediaQuery, } from '@mui/material';
import { useTheme } from "@mui/material/styles";

interface FormFieldsGridContainerPros {
  children: ReactNode;
}

export const FormFieldsGridContainer: React.FC<FormFieldsGridContainerPros> = ({
  children,
}) => {
  const theme = useTheme();
  return (
    <Grid
      container
      direction="column"
      spacing={2}
      style={{ width: useMediaQuery(theme.breakpoints.down("sm")) ? '100%' : '75%', marginLeft: 'auto', marginRight: 'auto' }}
    >
      {children}
    </Grid>
  );
};
