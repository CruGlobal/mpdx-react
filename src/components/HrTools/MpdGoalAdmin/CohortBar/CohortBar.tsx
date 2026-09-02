import React, { useState } from 'react';
import { ErrorOutline } from '@mui/icons-material';
import {
  Box,
  Link,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import {
  DynamicEditTrainingCostsModal,
  preloadEditTrainingCostsModal,
} from '../EditTrainingCostsModal/DynamicEditTrainingCostsModal';
import { useMpdGoalAdmin } from '../MpdGoalAdminContext';
import { TrainingCosts } from '../mpdGoalAdminHelpers';

interface StatProps {
  label: string;
  children: React.ReactNode;
}

const Stat: React.FC<StatProps> = ({ label, children }) => (
  <Box>
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{ textTransform: 'uppercase', display: 'block' }}
    >
      {label}
    </Typography>
    <Typography variant="body2">{children}</Typography>
  </Box>
);

export const CohortBar: React.FC = () => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const {
    cohorts,
    selectedCohortId,
    setSelectedCohortId,
    selectedCohort,
    saveTrainingCosts,
  } = useMpdGoalAdmin();
  const [trainingCostsOpen, setTrainingCostsOpen] = useState(false);

  // Only a loaded cohort can be short its costs; an absent one is still loading.
  const needsTrainingCosts =
    !!selectedCohort && !selectedCohort.hasTrainingCosts;

  const handleSaveTrainingCosts = async (costs: TrainingCosts) => {
    if (!selectedCohort) {
      return;
    }
    try {
      await saveTrainingCosts(selectedCohort.id, costs);
    } catch {
      // The global Apollo error link already toasts; keep the modal open to retry.
      return;
    }
    // MPDX-9913 specifies this toast; nothing on screen otherwise confirms the save.
    enqueueSnackbar(t('Per-Training Cost applied successfully.'), {
      variant: 'success',
    });
    setTrainingCostsOpen(false);
  };

  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={4}
      alignItems={{ xs: 'flex-start', md: 'center' }}
      sx={{ mb: 2 }}
    >
      <TextField
        select
        label={t('Training')}
        size="small"
        value={selectedCohortId}
        onChange={(event) => setSelectedCohortId(event.target.value)}
        sx={{ minWidth: 220 }}
        // An empty value with no matching MenuItem makes MUI warn.
        disabled={!cohorts.length}
      >
        {cohorts.map((cohort) => (
          <MenuItem key={cohort.id} value={cohort.id}>
            {cohort.name}
          </MenuItem>
        ))}
      </TextField>

      <Stat label={t('Training Size')}>
        {t('{{count}} New Staff', { count: selectedCohort?.trainingSize ?? 0 })}
      </Stat>
      <Stat label={t('NSO Date')}>{selectedCohort?.nsoDate ?? '—'}</Stat>
      <Stat label={t('Training Cost')}>
        {needsTrainingCosts ? (
          <Tooltip
            // Without this the tooltip becomes the button's aria-label and hides its text.
            describeChild
            title={t('Training costs are required to run & send goals.')}
          >
            <Link
              component="button"
              type="button"
              underline="hover"
              onClick={() => setTrainingCostsOpen(true)}
              onMouseEnter={preloadEditTrainingCostsModal}
              // MUI's warning palette is only 3.79:1 on white; the Cru vermilion
              // token clears WCAG AA for body2's 14px text.
              sx={(theme) => ({
                color: theme.palette.statusWarning.main,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
              })}
            >
              <ErrorOutline fontSize="small" />
              {t('Provide Training Cost')}
            </Link>
          </Tooltip>
        ) : (
          <Link
            component="button"
            type="button"
            underline="hover"
            disabled={!selectedCohort}
            onClick={() => setTrainingCostsOpen(true)}
            onMouseEnter={preloadEditTrainingCostsModal}
          >
            {t('View/Edit')}
          </Link>
        )}
      </Stat>
      {trainingCostsOpen && (
        <DynamicEditTrainingCostsModal
          open
          cohortName={selectedCohort?.name}
          initialCosts={selectedCohort?.trainingCosts}
          onClose={() => setTrainingCostsOpen(false)}
          onSave={handleSaveTrainingCosts}
        />
      )}
    </Stack>
  );
};
