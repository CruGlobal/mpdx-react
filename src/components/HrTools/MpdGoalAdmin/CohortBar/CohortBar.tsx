import React, { useState } from 'react';
import {
  Box,
  Link,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
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
  const {
    cohorts,
    selectedCohortId,
    setSelectedCohortId,
    selectedCohort,
    saveTrainingCosts,
  } = useMpdGoalAdmin();
  const [trainingCostsOpen, setTrainingCostsOpen] = useState(false);

  const handleSaveTrainingCosts = (costs: TrainingCosts) => {
    if (selectedCohort) {
      saveTrainingCosts(selectedCohort.id, costs);
    }
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
