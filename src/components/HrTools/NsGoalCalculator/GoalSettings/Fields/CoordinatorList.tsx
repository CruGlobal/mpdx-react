import React, { useId } from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface CoordinatorListProps {
  /** Read-only OneApp coordinator names, in the order the API returns them. */
  coordinators: string[];
}

/**
 * Read-only list of the attendee's MPD coordinators. Coordinators are derived
 * from OneApp roles and a ministry commonly has several (MPDX-9688), so they
 * are shown as a list rather than a single editable field.
 */
export const CoordinatorList: React.FC<CoordinatorListProps> = ({
  coordinators,
}) => {
  const { t } = useTranslation();
  const headingId = useId();

  if (coordinators.length === 0) {
    return null;
  }

  return (
    <Box>
      <Typography id={headingId} variant="body2" fontWeight="bold">
        {t('Coordinators')}
      </Typography>
      <Box component="ul" aria-labelledby={headingId} sx={{ m: 0, p: 0 }}>
        {coordinators.map((coordinator, index) => (
          <Typography
            component="li"
            variant="body2"
            key={`${index}-${coordinator}`}
            sx={{ listStyle: 'none' }}
          >
            {coordinator}
          </Typography>
        ))}
      </Box>
    </Box>
  );
};
