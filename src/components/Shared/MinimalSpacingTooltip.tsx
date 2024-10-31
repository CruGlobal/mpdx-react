import React, { ReactNode } from 'react';
import Tooltip from '@mui/material/Tooltip';

interface MinimalSpacingTooltipProps {
  title: ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  arrow?: boolean;
  children: ReactNode;
}

const MinimalSpacingTooltip: React.FC<MinimalSpacingTooltipProps> = ({
  title,
  placement = 'bottom',
  arrow = false,
  children,
}) => {
  return (
    <Tooltip
      title={title}
      placement={placement}
      arrow={arrow}
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
    >
      <span>{children}</span>
    </Tooltip>
  );
};

export default MinimalSpacingTooltip;
