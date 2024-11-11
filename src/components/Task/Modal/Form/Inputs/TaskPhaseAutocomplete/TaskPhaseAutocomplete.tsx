import { FocusEventHandler, Ref } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { FormikErrors, FormikTouched } from 'formik';
import { useTranslation } from 'react-i18next';
import { PhaseEnum } from 'src/graphql/types.generated';
import { useLocalizedConstants } from 'src/hooks/useLocalizedConstants';

interface TaskPhaseProps {
  options: PhaseEnum[];
  label?: string;
  onChange: (value: PhaseEnum | null) => void;
  value?: PhaseEnum | null;
  inputRef?: Ref<HTMLElement>;
  contactPhase?: PhaseEnum;
  required?: boolean;
  onBlur?: FocusEventHandler<HTMLDivElement>;
  errors?: FormikErrors<any>;
  touched?: FormikTouched<any>;
}

export const TaskPhaseAutocomplete: React.FC<TaskPhaseProps> = ({
  options,
  label,
  value,
  onChange,
  inputRef,
  contactPhase,
  required,
  onBlur,
  errors,
  touched,
}) => {
  const { t } = useTranslation();
  const { getLocalizedPhase } = useLocalizedConstants();

  return (
    <Autocomplete<PhaseEnum>
      openOnFocus
      autoHighlight
      autoSelect
      value={value || contactPhase}
      options={options}
      getOptionLabel={(phase) => getLocalizedPhase(phase)}
      renderInput={(params) => (
        <TextField
          {...params}
          required={required}
          inputRef={inputRef}
          label={label || t('Task Type')}
          error={!!errors?.taskPhase && Boolean(touched?.taskPhase)}
          helperText={
            errors?.taskPhase && touched?.taskPhase && t('Field is required')
          }
        />
      )}
      onChange={(_, value) => onChange(value)}
      onBlur={onBlur}
    />
  );
};
