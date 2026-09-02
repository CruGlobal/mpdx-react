import React from 'react';
import { Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface RunAndSendTooltipProps {
  /** False renders `children` bare, so an enabled control has no tooltip. */
  show: boolean;
  children: React.ReactElement;
}

/** The span is needed: a disabled control has neither mouse events nor a tab stop. */
export const RunAndSendTooltip: React.FC<RunAndSendTooltipProps> = ({
  show,
  children,
}) => {
  const { t } = useTranslation();

  if (!show) {
    return children;
  }

  return (
    <Tooltip
      title={t(
        'All inputs and per-training costs are required to run & send goals.',
      )}
    >
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- the disabled child has no tab stop of its own */}
      <span tabIndex={0}>{children}</span>
    </Tooltip>
  );
};
