import React from 'react';
import ErrorOutline from '@mui/icons-material/ErrorOutline';
import { Tooltip } from '@mui/material';

interface GrossSalaryMarkerProps {
  /** The grossSalaryWarning text; also the marker's accessible name */
  warning: string;
  /**
   * Whether the marker takes keyboard focus. Off inside the staff row, which
   * is already a button, so the row stays a single tab stop.
   */
  focusable?: boolean;
}

/** Red marker for a Monthly Gross Salary below the New Staff Monthly Salary. */
export const GrossSalaryMarker: React.FC<GrossSalaryMarkerProps> = ({
  warning,
  focusable = true,
}) => (
  <Tooltip title={warning}>
    <ErrorOutline
      fontSize="small"
      color="error"
      tabIndex={focusable ? 0 : undefined}
      titleAccess={warning}
      aria-label={warning}
    />
  </Tooltip>
);
