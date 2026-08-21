import React, { useState } from 'react';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import {
  Button,
  CircularProgress,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useMpdGoalAdmin } from '../MpdGoalAdminContext';
import { downloadPdf, generateCohortGoalsPdf } from './printCohortGoalsPdf';

/**
 * Export menu for the Active Goals toolbar. Holds "Print All", which exports
 * every goal in the selected training as one printable PDF for NSO hard copies.
 *
 * Deliberately separate from the selection-scoped bulk-actions menu: printing
 * is cohort-scoped — it ignores both the row selection and the search term —
 * so it has to stay reachable with no checkboxes ticked.
 *
 * "Print All" is disabled until the cohort's training costs have been entered:
 * without training costs the goal amounts aren't final, so printing may not act
 * on them. (Run & Send is expected to adopt the same gate when it is wired up —
 * it does not enforce it yet.)
 */
export const ExportGoalsMenu: React.FC = () => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { selectedCohort } = useMpdGoalAdmin();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [printing, setPrinting] = useState(false);

  const hasTrainingCosts = !!selectedCohort?.trainingCostEntered;

  const handlePrint = async () => {
    setAnchorEl(null);
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
    <>
      <Button
        variant="outlined"
        endIcon={<ArrowDropDownIcon />}
        onClick={(event) => setAnchorEl(event.currentTarget)}
        aria-haspopup="menu"
        aria-expanded={anchorEl ? 'true' : undefined}
        aria-busy={printing}
      >
        {t('Export')}
        {printing && (
          <CircularProgress size={16} color="inherit" sx={{ ml: 1 }} />
        )}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem
          disabled={!hasTrainingCosts || printing}
          onClick={handlePrint}
        >
          {t('Print All')}
        </MenuItem>
        {/* Visible rather than a tooltip: a disabled MenuItem takes no pointer
            or focus events, so hover text would never reach keyboard and
            screen reader users. */}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', maxWidth: 260, px: 2, pt: 0.5 }}
        >
          {hasTrainingCosts
            ? t('Prints every goal in {{cohort}}.', {
                cohort: selectedCohort?.name ?? '',
              })
            : t('Enter training costs for this cohort to print its goals.')}
        </Typography>
      </Menu>
    </>
  );
};
