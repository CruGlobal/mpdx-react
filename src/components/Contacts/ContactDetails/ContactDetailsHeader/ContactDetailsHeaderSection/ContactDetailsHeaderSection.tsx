import { Box, SvgIconTypeMap } from '@material-ui/core';
import { OverridableComponent } from '@material-ui/core/OverridableComponent';

import React, { ReactNode } from 'react';

interface Props {
  icon?: OverridableComponent<SvgIconTypeMap>;
  children: ReactNode;
}

export const ContactDetailsHeaderSection: React.FC<Props> = ({
  icon,
  children,
}: Props) => {
  return (
    <Box>
      <Box style={{ display: 'inline-block', width: 60 }}>{icon}</Box>
      <Box style={{ display: 'inline-block' }}>{children}</Box>
    </Box>
  );
};
