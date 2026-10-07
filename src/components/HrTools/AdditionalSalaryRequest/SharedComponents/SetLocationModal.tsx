import React, { useMemo, useState } from 'react';
import {
  Alert,
  Autocomplete,
  DialogActions,
  DialogContent,
  Stack,
  TextField,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { Trans, useTranslation } from 'react-i18next';
import {
  CancelButton,
  SubmitButton,
} from 'src/components/Shared/Modal/ActionButtons/ActionButtons';
import Modal from 'src/components/Shared/Modal/Modal';
import { useGoalCalculatorConstants } from 'src/hooks/useGoalCalculatorConstants';
import { useUpdateUserGeographicLocationMutation } from '../UpdateUserGeographicLocation.generated';

interface SetLocationModalProps {
  handleClose: () => void;
}

export const SetLocationModal: React.FC<SetLocationModalProps> = ({
  handleClose,
}) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { goalGeographicConstantMap, loading, unavailable } =
    useGoalCalculatorConstants();
  const [selected, setSelected] = useState<string | null>(null);
  const [updateGeographicLocation, { loading: saving }] =
    useUpdateUserGeographicLocationMutation();

  const locations = useMemo(
    () => Array.from(goalGeographicConstantMap.keys()),
    [goalGeographicConstantMap],
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selected) {
      return;
    }

    try {
      await updateGeographicLocation({
        variables: { geographicLocation: selected },
        refetchQueries: ['AdditionalSalaryRequest'],
      });
    } catch {
      return;
    }

    enqueueSnackbar(t('Saved successfully.'), { variant: 'success' });
    handleClose();
  };

  return (
    <Modal isOpen title={t('Set Your Location')} handleClose={handleClose}>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Stack gap={2}>
            <Alert severity="info">
              <Trans t={t}>
                You can only set your location here <strong>one time</strong>.
                After you save, the only way to change it is to submit a new
                Salary Calculation Form.
              </Trans>
            </Alert>
            <Autocomplete
              options={locations}
              value={selected}
              onChange={(_, location) => setSelected(location)}
              disabled={loading || saving || unavailable}
              disableClearable={selected !== null}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t('Nearest Geographic Multiplier Location')}
                  slotProps={{ formHelperText: { sx: { mx: 0 } } }}
                  helperText={t(
                    'If you live within 50 miles of one of the following metropolitan areas, please select it from the list. If not, select "None."',
                  )}
                />
              )}
            />
            {unavailable && (
              <Alert severity="warning">
                {t(
                  'Geographic locations are not available for this year, so this cannot be updated right now.',
                )}
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <CancelButton onClick={handleClose} disabled={saving}>
            {t('Cancel')}
          </CancelButton>
          <SubmitButton disabled={!selected || saving || unavailable}>
            {t('Save')}
          </SubmitButton>
        </DialogActions>
      </form>
    </Modal>
  );
};
