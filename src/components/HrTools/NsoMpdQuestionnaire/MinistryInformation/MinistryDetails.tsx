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

// TODO(MPDX-9758): Replace with the real ministry list from OneApp.
const ministries = [
  'Cru',
  'Cru High School',
  'Cru City',
  'Athletes in Action',
  'Bridges International',
];

export const MinistryDetails: React.FC = () => {
  const { t } = useTranslation();
  const { goalGeographicConstantMap, loading } = useGoalCalculatorConstants();

  const cities = useMemo(
    () => Array.from(goalGeographicConstantMap.keys()),
    [goalGeographicConstantMap],
  );

  const schema = useMemo(
    () =>
      yup.object({
        ministry: yup.string().required(t('Please select a ministry')),
        assignmentLocation: yup
          .string()
          .required(t('Please enter an assignment location')),
        nearestCity: yup
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
    fieldName: 'ministry',
    schema,
    saveOnChange: true,
  });

  const locationProps = useQuestionnaireAutoSave({
    fieldName: 'assignmentLocation',
    schema,
  });

  const cityProps = useQuestionnaireAutoSave({
    fieldName: 'nearestCity',
    schema,
    saveOnChange: true,
  });

  return (
    <Stack spacing={4}>
      <TextField
        select
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
      >
        <MenuItem value="" disabled>
          <Typography component="span" color="text.secondary">
            {t('Select a ministry')}
          </Typography>
        </MenuItem>
        {ministries.map((ministry) => (
          <MenuItem key={ministry} value={ministry}>
            {ministry}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        placeholder={t('What is your expected ministry assignment location?')}
        size="small"
        InputLabelProps={{ shrink: true }}
        {...locationProps}
      />

      {loading ? (
        <CircularProgress />
      ) : (
        <TextField
          select
          label={t(
            'Is your ministry assignment location within 50 miles of one of these cities?',
          )}
          size="small"
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
          { value: 'Field', label: t('Field') },
          { value: 'Office', label: t('Office') },
        ]}
      />
    </Stack>
  );
};
