import React, { useMemo } from 'react';
import LocationOn from '@mui/icons-material/LocationOn';
import MuseumSharp from '@mui/icons-material/MuseumSharp';
import {
  CircularProgress,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useGoalCalculatorConstants } from 'src/hooks/useGoalCalculatorConstants';
import { RadioQuestion } from '../Shared/RadioQuestion';
import { useQuestionnaireAutoSave } from '../Shared/useQuestionnaireAutoSave';
import { useOneAppMinistries } from './useOneAppMinistries';

export const MinistryDetails: React.FC = () => {
  const { t } = useTranslation();
  const { goalGeographicConstantMap, loading } = useGoalCalculatorConstants();
  const { ministries, loading: ministriesLoading } = useOneAppMinistries();
  const ministriesUnavailable = !ministriesLoading && ministries.length === 0;

  const cities = useMemo(
    () => Array.from(goalGeographicConstantMap.keys()),
    [goalGeographicConstantMap],
  );

  const schema = useMemo(
    () =>
      yup.object({
        ministryName: yup.string().required(t('Please select a ministry')),
        ministryLocation: yup
          .string()
          .required(t('Please enter an assignment location')),
        geographicLocation: yup
          .string()
          .required(
            t(
              'Please select an answer. If none of the cities apply, select "None."',
            ),
          ),
        assignmentType: yup
          .string()
          .required(t('Please select an assignment type')),
      }),
    [t],
  );

  const ministryProps = useQuestionnaireAutoSave({
    fieldName: 'ministryName',
    schema,
    saveOnChange: true,
  });

  const locationProps = useQuestionnaireAutoSave({
    fieldName: 'ministryLocation',
    schema,
  });

  const cityProps = useQuestionnaireAutoSave({
    fieldName: 'geographicLocation',
    schema,
    saveOnChange: true,
  });

  return (
    <Stack spacing={4}>
      <TextField
        select
        required
        label={t('What ministry are you expecting to serve with?')}
        size="small"
        SelectProps={{ displayEmpty: true }}
        InputLabelProps={{ shrink: true }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <MuseumSharp />
            </InputAdornment>
          ),
        }}
        {...ministryProps}
        disabled={ministriesLoading || ministriesUnavailable}
        {...(ministriesUnavailable
          ? { error: true, helperText: t('Failed to load ministries') }
          : {})}
      >
        <MenuItem value="" disabled>
          <Typography component="span" color="text.secondary">
            {ministriesLoading
              ? t('Loading ministries…')
              : t('Select a ministry')}
          </Typography>
        </MenuItem>
        {ministries.map((ministry) => (
          <MenuItem key={ministry.id} value={ministry.name}>
            {ministry.name}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        required
        label={t('What is your expected ministry assignment location?')}
        size="small"
        {...locationProps}
      />

      {loading ? (
        <CircularProgress />
      ) : (
        <TextField
          select
          required
          label={t(
            'Is your ministry assignment location within 50 miles of one of these cities?',
          )}
          size="small"
          helperText={t('If none of the locations apply, select "None."')}
          SelectProps={{ displayEmpty: true }}
          InputLabelProps={{ shrink: true }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LocationOn />
              </InputAdornment>
            ),
          }}
          {...cityProps}
        >
          <MenuItem value="" disabled>
            <Typography component="span" color="text.secondary">
              {t('Select a city')}
            </Typography>
          </MenuItem>
          {cities.map((city) => (
            <MenuItem key={city} value={city}>
              {city}
            </MenuItem>
          ))}
        </TextField>
      )}

      <RadioQuestion
        fieldName="assignmentType"
        schema={schema}
        row
        label={t('What type of assignment are you expecting?')}
        options={[
          { value: 'FIELD', label: t('Field') },
          { value: 'OFFICE', label: t('Office') },
        ]}
      />
    </Stack>
  );
};
