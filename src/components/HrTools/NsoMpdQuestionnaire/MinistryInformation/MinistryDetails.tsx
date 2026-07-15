import React, { useMemo } from 'react';
import LocationOn from '@mui/icons-material/LocationOn';
import MuseumSharp from '@mui/icons-material/MuseumSharp';
import { CircularProgress, Stack, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useGoalCalculatorConstants } from 'src/hooks/useGoalCalculatorConstants';
import { LabeledField } from '../Shared/LabeledField';
import { RadioQuestion } from '../Shared/RadioQuestion';
import { SelectQuestion } from '../Shared/SelectQuestion';
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

  const {
    error: locationError,
    helperText: locationHelperText,
    ...locationFieldProps
  } = useQuestionnaireAutoSave({
    fieldName: 'ministryLocation',
    schema,
  });

  return (
    <Stack spacing={4}>
      <SelectQuestion
        fieldName="ministryName"
        schema={schema}
        label={t('What ministry are you expecting to serve with?')}
        placeholder={
          ministriesLoading ? t('Loading ministries…') : t('Select a ministry')
        }
        startAdornment={<MuseumSharp />}
        disabled={ministriesLoading || ministriesUnavailable}
        errorText={
          ministriesUnavailable ? t('Failed to load ministries') : undefined
        }
        options={ministries.map((ministry) => ({
          value: ministry.name,
          label: ministry.name,
        }))}
      />

      <LabeledField
        label={t('What is your expected ministry assignment location?')}
        required
        error={locationError}
        helperText={locationHelperText}
      >
        {(aria) => (
          <TextField
            required
            error={locationError}
            size="small"
            slotProps={{ htmlInput: { ...aria } }}
            {...locationFieldProps}
          />
        )}
      </LabeledField>

      {loading ? (
        <CircularProgress />
      ) : (
        <SelectQuestion
          fieldName="geographicLocation"
          schema={schema}
          label={t(
            'Is your ministry assignment location within 50 miles of one of these cities?',
          )}
          placeholder={t('Select a city')}
          startAdornment={<LocationOn />}
          helperText={t('If none of the locations apply, select "None."')}
          options={cities.map((city) => ({ value: city, label: city }))}
        />
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
