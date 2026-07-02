import React, { useMemo } from 'react';
import Phone from '@mui/icons-material/Phone';
import { InputAdornment, TextField } from '@mui/material';
import { useTheme } from '@mui/material/styles';
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
   * Accessible name for the input.
   */
  ariaLabel: string;
}

export const PhoneNumberField: React.FC<PhoneNumberFieldProps> = ({
  fieldName,
  ariaLabel,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

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
      placeholder={placeholder}
      size="small"
      fullWidth
      sx={{ maxWidth: theme.spacing(40) }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Phone />
          </InputAdornment>
        ),
      }}
      inputProps={{ 'aria-label': ariaLabel }}
      {...fieldProps}
    />
  );
};
