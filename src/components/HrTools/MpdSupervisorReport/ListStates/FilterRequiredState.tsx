import React from 'react';
import FilterListIcon from '@mui/icons-material/FilterList';
import { Box, Button, LinearProgress, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { FilterRequired } from '../MpdSupervisorReportContext';

interface FilterRequiredStateProps {
  filterRequired: FilterRequired;
  loading?: boolean;
  /** Opens the filter panel; omitted while it is already open */
  onOpenFilters?: () => void;
}

/**
 * The API's row cap, shown as guidance rather than as an error: the report
 * lists nothing until the supervisor narrows it.
 */
export const FilterRequiredState: React.FC<FilterRequiredStateProps> = ({
  filterRequired: { count, filtered },
  loading = false,
  onOpenFilters,
}) => {
  const { t } = useTranslation();

  return (
    <Box
      role="status"
      aria-busy={loading}
      sx={{ textAlign: 'center', mt: 8, mx: 'auto', maxWidth: 480, px: 2 }}
    >
      <Box sx={{ opacity: loading ? 0.6 : 1, transition: 'opacity 150ms' }}>
        <FilterListIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
        {/* `total`, not `count`: the number is always above the cap, so no plural forms */}
        <Typography variant="h6" component="h2" sx={{ mt: 1 }}>
          {filtered
            ? t('{{total}} staff match — still too many to list at once.', {
                total: count,
              })
            : t('You supervise {{total}} staff — too many to list at once.', {
                total: count,
              })}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          {filtered
            ? t('Add another filter or search by name to narrow the list.')
            : t(
                'Search by name, or pick a team, department, employment type, person type or one of the negative-month filters.',
              )}
        </Typography>
      </Box>
      <Box sx={{ height: 4, mt: 2 }}>
        {loading && <LinearProgress aria-label={t('Refreshing staff')} />}
      </Box>
      {onOpenFilters && (
        <Button variant="contained" onClick={onOpenFilters} sx={{ mt: 2 }}>
          {t('Open filters')}
        </Button>
      )}
    </Box>
  );
};
