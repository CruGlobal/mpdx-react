import { Box } from '@mui/material';
import React, { ReactElement } from 'react';
import { AppealProgress } from './AppealProgress';

const control = {
  type: 'range',
  min: 0,
  max: 100,
};
export default {
  title: 'Coaching/AppealProgress',
  args: { loading: false, isPrimary: false },
  argTypes: {
    received: { control },
    pledged: { control },
  },
};

export const Default = ({
  isPrimary,
  loading,
  received,
  pledged,
}: {
  loading: boolean;
  isPrimary: boolean;
  received: number;
  pledged: number;
}): ReactElement => {
  return (
    <Box m={2}>
      <AppealProgress
        currency={'USD'}
        isPrimary={isPrimary}
        loading={loading}
        goal={100}
        received={received}
        pledged={pledged}
      />
    </Box>
  );
};

Default.args = {
  received: 50,
  pledged: 75,
};
