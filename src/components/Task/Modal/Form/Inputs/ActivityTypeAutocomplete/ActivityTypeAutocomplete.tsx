import { FocusEventHandler, Ref, useMemo } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { FormikErrors, FormikTouched } from 'formik';
import { useTranslation } from 'react-i18next';
import { ActivityTypeEnum } from 'src/graphql/types.generated';
import { usePhaseData } from 'src/hooks/usePhaseData';

interface ActivityTypeProps {
  options: ActivityTypeEnum[];
  label: string;
  value: ActivityTypeEnum | null;
  onChange: (value: ActivityTypeEnum | null) => void;
  // Set to true to make None an acceptable value. Otherwise, None will be converted to undefined.
  preserveNone?: boolean;
  inputRef?: Ref<HTMLElement>;
  required?: boolean;
  onBlur?: FocusEventHandler<HTMLDivElement>;
  errors?: FormikErrors<any>;
  touched?: FormikTouched<any>;
}

export const ActivityTypeAutocomplete: React.FC<ActivityTypeProps> = ({
  options,
  label,
  value,
  onChange,
  preserveNone = false,
  inputRef,
  required,
  onBlur,
  errors,
  touched,
}) => {
  const { t } = useTranslation();
  const { activityTypes } = usePhaseData();

  const sortedOptions = useMemo(() => {
    // Sort none to the top
    return options.slice().sort((a) => (a === ActivityTypeEnum.None ? -1 : 0));
  }, [options]);

  return (
    <Autocomplete<ActivityTypeEnum>
      openOnFocus
      autoSelect
      value={value === null || typeof value === 'undefined' ? null : value}
      options={sortedOptions}
      getOptionLabel={(activity) => {
        if (activity === ActivityTypeEnum.None) {
          return t('None');
        } else if (sortedOptions.length > 15) {
          return activityTypes?.get(activity)?.translatedFullName || '';
        } else {
          return activityTypes?.get(activity)?.translatedShortName || '';
        }
      }}
      renderInput={(params) => (
        <TextField
          inputRef={inputRef}
          {...params}
          label={label}
          required={required}
          error={!!errors?.activityType && Boolean(touched?.activityType)}
          helperText={
            errors?.activityType &&
            touched?.activityType &&
            t('Field is required')
          }
        />
      )}
      onChange={(_, value) => {
        onChange(
          !preserveNone && value === ActivityTypeEnum.None
            ? null
            : value || null,
        );
      }}
      onBlur={onBlur}
      disabled={!options.length}
    />
  );
};
