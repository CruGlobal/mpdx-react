import React from 'react';
import Tooltip, { TooltipProps } from '@mui/material/Tooltip';

const MinimalSpacingTooltip: React.FC<TooltipProps> = (props) => {
  return (
    <Tooltip
      PopperProps={{
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, -5],
            },
          },
        ],
      }}
      {...props}
    />
  );
};

export default MinimalSpacingTooltip;
