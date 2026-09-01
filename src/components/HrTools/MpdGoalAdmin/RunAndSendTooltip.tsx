import React from 'react';
import { Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface RunAndSendTooltipProps {
  /** False renders `children` bare, so an enabled control has no tooltip. */
  show: boolean;
  children: React.ReactElement;
}

/**
 * Explains why a Run & Send control is inert. The span is required because a
 * disabled MUI control fires no mouse events for the tooltip to listen to.
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
      <span>{children}</span>
    </Tooltip>
  );
};
