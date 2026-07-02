import React, { useMemo } from 'react';
import Phone from '@mui/icons-material/Phone';
import { InputAdornment, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { phoneNumber } from 'src/lib/yupHelpers';
import {
  QuestionnaireField,
  useQuestionnaireAutoSave,
} from '../Shared/useQuestionnaireAutoSave';

const placeholder = '000-000-0000';

interface PhoneNumberFieldProps {
  fieldName: Extract<QuestionnaireField, 'phoneNumber' | 'spousePhoneNumber'>;
  /**
   * Visible, person-scoped label (e.g. "Jane's cell phone number") so the user and spouse fields
   * have distinct accessible names for screen readers.
   */
  label: string;
}

export const PhoneNumberField: React.FC<PhoneNumberFieldProps> = ({
  fieldName,
  label,
}) => {
  const { t } = useTranslation();

  const schema = useMemo(
    () =>
      yup.object({
        [fieldName]: phoneNumber(t).required(
          t('Cell phone number is required'),
        ),
      }),
    [t, fieldName],
  );

  const fieldProps = useQuestionnaireAutoSave({ fieldName, schema });

  return (
    <TextField
      required
      label={label}
      placeholder={placeholder}
      size="small"
      fullWidth
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Phone />
          </InputAdornment>
        ),
      }}
      {...fieldProps}
    />
  );
};
