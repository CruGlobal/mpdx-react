import React, { useState } from 'react';
import { Button, CircularProgress, Tooltip } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useRequiredSession } from 'src/hooks/useRequiredSession';
import { useMpdGoalAdmin } from '../MpdGoalAdminContext';
import { usePrintNewStaffCohortGoalsMutation } from '../NewStaffCohorts.generated';
import { downloadPdf, fetchCohortGoalsPdf } from './printCohortGoalsPdf';

/** Exports the cohort's Support Goals Worksheets as one PDF; gated on training costs. */
export const PrintCohortGoalsButton: React.FC = () => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { apiToken } = useRequiredSession();
  const { selectedCohort, filteredRows, search } = useMpdGoalAdmin();
  const [printNewStaffCohortGoals] = usePrintNewStaffCohortGoalsMutation();
  const [printing, setPrinting] = useState(false);

  const hasTrainingCosts = !!selectedCohort?.hasTrainingCosts;
  const searchActive = !!search.trim();

  /** Redeems the single-use URL and saves the file; false when the download itself failed. */
  const savePdf = async (
    downloadUrl: string,
    filename: string,
  ): Promise<boolean> => {
    try {
      downloadPdf(await fetchCohortGoalsPdf(downloadUrl, apiToken), filename);
      return true;
    } catch {
      // Not an Apollo call, so the global error link never sees this failure.
      enqueueSnackbar(t('Unable to download the MPD Goals PDF.'), {
        variant: 'error',
      });
      return false;
    }
  };

  const handlePrint = async () => {
    if (!selectedCohort) {
      return;
    }
    setPrinting(true);
    try {
      const { data } = await printNewStaffCohortGoals({
        variables: {
          input: {
            cohortId: selectedCohort.id,
            // Omitted unsearched so the server prints the whole training: filteredRows holds only
            // the pages fetched so far, so sending ids could quietly print a subset.
            ...(searchActive && {
              attendeeIds: filteredRows.map((row) => row.id),
            }),
          },
        },
      });

      const printResult = data?.printNewStaffCohortGoals;
      if (!printResult?.downloadUrl) {
        enqueueSnackbar(t('No MPD goals are ready to print.'), {
          variant: 'info',
        });
        return;
      }

      const saved = await savePdf(
        printResult.downloadUrl,
        `MPD Goals - ${selectedCohort.name}.pdf`,
      );
      // Otherwise a household with no calculation is missing from the PDF with no explanation.
      if (saved && printResult.skippedCount > 0) {
        enqueueSnackbar(
          t(
            '{{count}} households have no MPD goal calculation yet and were left out.',
            { count: printResult.skippedCount },
          ),
          { variant: 'warning' },
        );
      }
    } catch {
      // The mutation rejected; the global Apollo error link already toasted the reason.
      return;
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
