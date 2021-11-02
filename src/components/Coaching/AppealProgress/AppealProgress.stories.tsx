import { Box } from '@material-ui/core';
import React, { ReactElement } from 'react';
import { AppealProgress } from './AppealProgress';

const control = {
  type: 'range',
  min: 0,
  max: 100,
};
export default {
  title: 'Coaching/AppealProgress',
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
      <AppealProgress />
    </Box>
  );
};

Default.args = {
  primary: 50,
  secondary: 75,
};
