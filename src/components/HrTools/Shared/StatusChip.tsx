import React from 'react';
import { Chip, darken, lighten } from '@mui/material';

export type StatusChipColor = 'success' | 'warning' | 'info' | 'error';

interface StatusChipProps {
  label: string;
  color: StatusChipColor;
}

/**
 * The solid, borderless status chip the goal designs use.
 *
 * Fill and text come from `palette[color].light` the way MUI's Alert builds
 * them, because `palette[color].main` is under WCAG AA at this text size.
 */
export const StatusChip: React.FC<StatusChipProps> = ({ label, color }) => (
  <Chip
    size="small"
    label={label}
    // Kept for the semantic MuiChip-color* class; the sx below sets the colors.
    color={color}
    sx={(theme) => ({
      backgroundColor: lighten(theme.palette[color].light, 0.9),
      color: darken(theme.palette[color].light, 0.6),
      border: 'none',
    })}
  />
);
