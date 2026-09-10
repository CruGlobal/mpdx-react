import React from 'react';
import { Alert, Stack } from '@mui/material';
import { useGoalSettingsPreview } from './GoalSettingsPreviewContext';
import { WarningSeverity } from './goalSettingsWarnings';

/** Errors before cautions, so the more urgent group reads first. */
const SEVERITIES: readonly WarningSeverity[] = ['error', 'warning'];

/**
 * The non-blocking admin warnings from NSGC A33, rendered beside the save
 * actions so an admin sees them at the point of Save & Share regardless of how
 * far the long form has scrolled. Built by the preview provider, which also
 * drives the matching field outlines, so the two always agree.
 *
 * Grouped into one alert per severity rather than a row per warning: up to five
 * can apply at once, and five separately coloured rows read as noise. The two
 * alerts sit side by side so the sticky bar stays short.
 */
export const GoalSettingsWarning: React.FC = () => {
  const warnings = useGoalSettingsPreview()?.warnings ?? [];

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1}
      aria-live="polite"
    >
      {SEVERITIES.map((severity) => {
        const grouped = warnings.filter(
          (warning) => warning.severity === severity,
        );

        return grouped.length ? (
          <Alert
            key={severity}
            severity={severity}
            role="presentation"
            sx={{ ul: { pl: 2 } }}
          >
            <ul>
              {grouped.map(({ key, message }) => (
                <li key={key}>{message}</li>
              ))}
            </ul>
          </Alert>
        ) : null;
      })}
    </Stack>
  );
};
