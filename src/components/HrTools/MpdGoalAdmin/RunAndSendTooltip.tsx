import React from 'react';
import { Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface RunAndSendTooltipProps {
  /** False renders `children` bare, so an enabled control has no tooltip. */
  show: boolean;
  children: React.ReactElement;
}

/**
 * Explains why a Run & Send control is inert. The span is required twice over: a
 * disabled MUI control fires no mouse events for the tooltip to listen to, and
 * it leaves the tab order, so the span carries the only reachable focus target.
 */
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
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex --
          the span is the accessible stand-in for a disabled control, which is
          out of the tab order, so without a tab stop here the reason the action
          is unavailable is reachable by hover only. */}
      <span tabIndex={0}>{children}</span>
    </Tooltip>
  );
};
