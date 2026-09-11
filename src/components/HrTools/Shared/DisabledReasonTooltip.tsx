import React from 'react';
import { Tooltip } from '@mui/material';

interface DisabledReasonTooltipProps {
  /** Already-translated reason; null renders `children` bare, so an enabled control has no tooltip. */
  reason?: string | null;
  children: React.ReactElement;
}

/** The span is needed: a disabled control has neither mouse events nor a tab stop. */
export const DisabledReasonTooltip: React.FC<DisabledReasonTooltipProps> = ({
  reason,
  children,
}) => {
  if (!reason) {
    return children;
  }

  return (
    <Tooltip title={reason}>
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- the disabled child has no tab stop of its own */}
      <span tabIndex={0}>{children}</span>
    </Tooltip>
  );
};
