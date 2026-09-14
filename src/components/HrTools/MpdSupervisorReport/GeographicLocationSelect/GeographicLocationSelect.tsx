import React, { useMemo, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  TextField,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import {
  GEOGRAPHIC_LOCATION_NONE,
  useGoalCalculatorConstants,
} from 'src/hooks/useGoalCalculatorConstants';
import { useLocale } from 'src/hooks/useLocale';
import { percentageFormat } from 'src/lib/intlFormat';
import { useUpdateStaffGeographicLocationMutation } from './UpdateStaffGeographicLocation.generated';

interface GeographicLocationSelectProps {
  firstName: string;
  personNumber: string;
  geographicLocation: string | null | undefined;
  onSaved: (geographicLocation: string, newStaffMonthlySalary: number) => void;
}

export const GeographicLocationSelect: React.FC<
  GeographicLocationSelectProps
> = ({ firstName, personNumber, geographicLocation, onSaved }) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { enqueueSnackbar } = useSnackbar();
  const { goalGeographicConstantMap, loading, unavailable } =
    useGoalCalculatorConstants();
  const savedLocation = geographicLocation ?? null;
  const [selected, setSelected] = useState<string | null>(savedLocation);
  const [updateGeographicLocation, { loading: saving }] =
    useUpdateStaffGeographicLocationMutation();

  const locations = useMemo(
    () => Array.from(goalGeographicConstantMap.keys()),
    [goalGeographicConstantMap],
  );

  const getLocationLabel = (location: string) => {
    const multiplier = goalGeographicConstantMap.get(location);
    if (multiplier === undefined || multiplier === 0) {
      return location;
    }
    return `${location} (${percentageFormat(multiplier, locale)})`;
  };

  const handleSave = async () => {
    if (!selected) {
      return;
    }

    await updateGeographicLocation({
      variables: { input: { personNumber, geographicLocation: selected } },
      refetchQueries: ['QuarterlyPayrollHistory'],
      update: (cache, { data }) => {
        const payload = data?.updateManagedStaffGeographicLocation;
        if (!payload) {
          return;
        }
        const cacheId = cache.identify({
          __typename: 'MpdManagedStaff',
          personNumber,
        });
        if (!cacheId) {
          return;
        }
        cache.modify({
          id: cacheId,
          fields: {
            geographicLocation: () => payload.geographicLocation,
            newStaffMonthlySalary: () => payload.newStaffMonthlySalary,
          },
        });
      },
      onCompleted: (data) => {
        const payload = data.updateManagedStaffGeographicLocation;
        if (!payload) {
          enqueueSnackbar(
            t('Failed to save geographic location. Please try again.'),
            {
              variant: 'error',
            },
          );
          return;
        }
        enqueueSnackbar(t('Saved successfully'), { variant: 'success' });
        onSaved(payload.geographicLocation, payload.newStaffMonthlySalary);
      },
    });
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1,
          flexWrap: 'wrap',
        }}
      >
        <Autocomplete
          options={locations}
          getOptionLabel={getLocationLabel}
          value={selected}
          onChange={(_, location) => setSelected(location)}
          disabled={loading || saving || unavailable}
          size="small"
          sx={{ minWidth: 220 }}
          renderInput={(params) => (
            <TextField
              {...params}
              label={t('Geographic Location')}
              helperText={t(
                'The major city within 50 miles of {{firstName}}. If none apply, select "None".',
                { firstName },
              )}
            />
          )}
        />
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={
            !selected || selected === savedLocation || saving || unavailable
          }
          aria-busy={saving}
          startIcon={
            saving ? <CircularProgress size={20} color="inherit" /> : null
          }
        >
          {saving ? t('Saving...') : t('Save')}
        </Button>
      </Box>

      {unavailable && (
        <Alert severity="warning" sx={{ width: '100%' }}>
          {t(
            'Geographic locations are not available for this year, so this cannot be updated right now.',
          )}
        </Alert>
      )}

      {!unavailable && !savedLocation && (
        <Alert severity="warning" sx={{ width: '100%' }}>
          {t(
            'No geographic location is set for {{firstName}}. Select one so the new staff monthly salary reflects their cost of living correctly.',
            { firstName },
          )}
        </Alert>
      )}

      {savedLocation === GEOGRAPHIC_LOCATION_NONE && (
        <Alert severity="info" sx={{ width: '100%' }}>
          {t(
            '"None" applies no adjustment to the new staff monthly salary. Please select a city if {{firstName}} lives near one.',
            { firstName },
          )}
        </Alert>
      )}
    </>
  );
};
