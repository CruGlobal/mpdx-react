import React, { useState } from 'react';
import { Button, CircularProgress, Tooltip } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useMpdGoalAdmin } from '../MpdGoalAdminContext';
import { downloadPdf, generateCohortGoalsPdf } from './printCohortGoalsPdf';

/**
 * "Print All" — exports every goal in the selected cohort as a single
 * printable PDF (used for NSO hard copies). Disabled until the cohort's
 * training costs have been entered: without training costs the goal amounts
 * aren't final, so printing may not act on them. (Run & Send is expected to
 * adopt the same gate when it is wired up — it does not enforce it yet.)
 */
export const PrintCohortGoalsButton: React.FC = () => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { selectedCohort } = useMpdGoalAdmin();
  const [printing, setPrinting] = useState(false);

  const hasTrainingCosts = !!selectedCohort?.trainingCostEntered;

  const handlePrint = async () => {
    if (!selectedCohort) {
      return;
    }
    setPrinting(true);
    try {
      const url = await generateCohortGoalsPdf(selectedCohort);
      downloadPdf(url, `MPD Goals - ${selectedCohort.name}.pdf`);
    } catch {
      // TODO(MPDX-9691): once generation is a GraphQL mutation, the global
      // Apollo error link will already toast failures — remove this snackbar
      // (or suppress the generic one) so the user isn't double-toasted.
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
        hasTrainingCosts
          ? t('Prints every goal in {{cohort}}.', {
              cohort: selectedCohort?.name ?? '',
            })
          : t('Enter training costs for this cohort to print its goals.')
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
          {t('Print All')}
          {printing && (
            <CircularProgress size={16} color="inherit" sx={{ ml: 1 }} />
          )}
        </Button>
      </span>
    </Tooltip>
  );
};
