import React, { useId } from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface CoordinatorListProps {
  coordinators: string[];
}

/** Read-only coordinators, derived from OneApp roles and never editable here. */
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
      <Typography
        id={headingId}
        component="h6"
        variant="body2"
        fontWeight="bold"
      >
        {t('Coordinators')}
      </Typography>
      {/* WebKit strips the implicit list role once the markers are removed. */}
      <Box
        component="ul"
        role="list"
        aria-labelledby={headingId}
        sx={{ m: 0, p: 0 }}
      >
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
