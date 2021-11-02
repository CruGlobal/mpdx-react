import { Box } from '@material-ui/core';
import React, { ReactElement } from 'react';

interface Props {
  loading?: boolean;
  primary?: number;
  secondary?: number;
}

export const AppealProgress = ({
  loading,
  primary = 0,
  secondary = 0,
}: Prop): ReactElement => {
  return <Box></Box>;
};
