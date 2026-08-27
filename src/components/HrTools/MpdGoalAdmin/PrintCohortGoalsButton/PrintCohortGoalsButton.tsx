import React, { useState } from 'react';
import { Button, CircularProgress, Tooltip } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useMpdGoalAdmin } from '../MpdGoalAdminContext';
import { downloadPdf, generateCohortGoalsPdf } from './printCohortGoalsPdf';

/** Exports the cohort's goals as one PDF; gated on training costs. */
export const PrintCohortGoalsButton: React.FC = () => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { selectedCohort, filteredRows, search } = useMpdGoalAdmin();
  const [printing, setPrinting] = useState(false);

  const hasTrainingCosts = !!selectedCohort?.hasTrainingCosts;
  const searchActive = !!search.trim();

  const handlePrint = async () => {
    if (!selectedCohort) {
      return;
    }
    setPrinting(true);
    try {
      const url = await generateCohortGoalsPdf(selectedCohort, filteredRows);
      downloadPdf(url, `MPD Goals - ${selectedCohort.name}.pdf`);
    } catch {
      // TODO(MPDX-9691): drop this snackbar once the mutation error link covers it.
      enqueueSnackbar(t('Unable to export the MPD Goals PDF.'), {
        variant: 'error',
      });
    } finally {
      setPrinting(false);
    }
  };

  return (
    <Tooltip
      title={
        !hasTrainingCosts
          ? t('Enter training costs for this cohort to print its goals.')
          : searchActive
            ? t('Prints the goals matching your search in {{cohort}}.', {
                cohort: selectedCohort?.name ?? '',
              })
            : t('Prints every goal in {{cohort}}.', {
                cohort: selectedCohort?.name ?? '',
              })
      }
    >
      {/* span so the tooltip still fires while the button is disabled */}
      <span>
        <Button
          variant="outlined"
          disabled={!hasTrainingCosts || printing}
          onClick={handlePrint}
          aria-busy={printing}
        >
          {searchActive ? t('Print Matching') : t('Print All')}
          {printing && (
            <CircularProgress size={16} color="inherit" sx={{ ml: 1 }} />
          )}
        </Button>
      </span>
    </Tooltip>
  );
};
