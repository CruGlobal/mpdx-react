import React, { useId } from 'react';
import { Box, Divider, SxProps, Theme, Typography } from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { useTranslation } from 'react-i18next';
import { MpdCapHealthEnum } from 'src/graphql/types.generated';
import {
  capHealthDescription,
  capHealthLabel,
} from '../Filters/mpdSupervisorReportFilters';
import { CapHealthBadge } from '../StaffMemberRow/CapHealthBadge';

const grades = [
  MpdCapHealthEnum.Healthy,
  MpdCapHealthEnum.OnTrack,
  MpdCapHealthEnum.NeedsAttention,
];

/** The legend's explanation of the health badge beside each name. */
export const CapHealthLegendSection: React.FC = () => {
  const { t } = useTranslation();
  const headingId = useId();

  return (
    <Box component="section" aria-labelledby={headingId}>
      <Divider sx={{ my: 2 }} />
      <Typography
        id={headingId}
        variant="subtitle1"
        component="h3"
        fontWeight={600}
        mb={1}
      >
        {t('Health badge')}
      </Typography>
      <Typography variant="body2" sx={{ mb: 1 }}>
        {t(
          "Supported staff get a badge beside their name after their first paycheck. It grades last month's payroll as a percent of their Personal CAP, the % of Personal CAP on the Payroll tab, and is separate from the quarter colors.",
        )}
      </Typography>
      {grades.map((grade) => (
        <Box
          key={grade}
          sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1 }}
        >
          {/* One width for every sample so the descriptions line up */}
          <Box aria-hidden sx={{ flexShrink: 0, width: 128 }}>
            <CapHealthBadge capHealth={grade} />
          </Box>
          <Typography variant="body2" data-testid="cap-health-description">
            {/* The sample badge is hidden, so screen readers hear the grade here */}
            <Box component="span" sx={visuallyHidden as SxProps<Theme>}>
              {`${capHealthLabel(t, grade)}: `}
            </Box>
            {capHealthDescription(t, grade)}
          </Typography>
        </Box>
      ))}
      <Typography variant="body2" color="text.secondary">
        {t(
          "Volunteers, Staff Emeritus and other non-workers get no badge and match none of these filters, even when they're supported. Neither do department-funded and other unsupported staff. Supported staff get no badge without a Personal CAP, when last month was their first payroll month, or when last month's figures aren't in yet. A couple shares one Personal CAP, so both get a badge when either one is supported staff. The current month is never graded.",
        )}
      </Typography>
    </Box>
  );
};
