import React, { ReactElement } from 'react';
import { Box } from '@mui/material';
import StyledProgress from '.';

const control = {
  type: 'range',
  min: 0,
  max: 100,
  step: 1,
};

export default {
  title: 'StyledProgress',
  args: { loading: false },
  argTypes: {
    primary: { control },
    secondary: { control },
  },
};

export const Default = ({
  primary,
  secondary,
  loading,
}: {
  primary: number;
  secondary: number;
  loading: boolean;
}): ReactElement => {
  return (
    <Box m={2}>
      <StyledProgress
        primary={primary / 100}
        secondary={secondary / 100}
        loading={loading}
      />
    </Box>
  );
};
Default.args = {
  primary: 50,
  secondary: 75,
};

export const WhenMin = (): ReactElement => {
  return (
    <Box m={2}>
      <StyledProgress primary={0} secondary={0} />
    </Box>
  );
};
export const WhenMax = (): ReactElement => {
  return (
    <Box m={2}>
      <StyledProgress primary={0.5} secondary={1} />
    </Box>
  );
};
export const Loading = (): ReactElement => {
  return (
    <Box m={2}>
      <StyledProgress loading />
    </Box>
  );
};
export const Empty = (): ReactElement => {
  return (
    <Box m={2}>
      <StyledProgress />
    </Box>
  );
};
