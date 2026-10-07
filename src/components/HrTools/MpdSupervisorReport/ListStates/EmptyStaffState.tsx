import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useMpdSupervisorReport } from '../MpdSupervisorReportContext';

/**
 * Shown when the query returns no rows. Distinguishes an empty roster from
 * filters that excluded everyone, and offers a way out of the latter.
 */
export const EmptyStaffState: React.FC = () => {
  const { t } = useTranslation();
  const { activeFilterCount, search, clearFilters } = useMpdSupervisorReport();
  const filtered = activeFilterCount > 0 || search.trim() !== '';

  return (
    <Box sx={{ textAlign: 'center', mt: 4 }}>
      <Typography color="text.secondary">
        {filtered
          ? t('No staff match your filters')
          : t('No staff members found')}
      </Typography>
      {filtered && (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {t('Try removing a filter or changing your search.')}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={clearFilters}
            sx={{ mt: 2 }}
          >
            {t('Clear filters')}
          </Button>
        </>
      )}
    </Box>
  );
};
