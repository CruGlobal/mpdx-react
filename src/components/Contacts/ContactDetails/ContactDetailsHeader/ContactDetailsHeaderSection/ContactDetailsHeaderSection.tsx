import { Box } from '@material-ui/core';

import React, { ReactElement, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  icon?: ReactNode;
}

export const ContactDetailsHeaderSection = ({
  icon,
  children,
}: Props): ReactElement => {
  return (
    <Box>
      <Box style={{ display: 'inline-block', width: 60 }}>{icon}</Box>
      <Box style={{ display: 'inline-block' }}>{children}</Box>
    </Box>
  );
};
