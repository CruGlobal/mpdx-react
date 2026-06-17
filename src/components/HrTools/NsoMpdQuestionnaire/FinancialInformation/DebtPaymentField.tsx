import React from 'react';
import {
  FormControl,
  FormHelperText,
  InputAdornment,
  OutlinedInput,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useQuestionnaireAutoSave } from '../Shared/useQuestionnaireAutoSave';

interface DebtPaymentFieldProps {
  fieldName: string;
  schema: yup.Schema;
  debtType: string;
  icon: React.ReactNode;
}

/**
 * A single whole-dollar monthly-payment input. Rendered only while the debt question is "Yes";
 * unmounting it (on "No") both discards its value and marks it valid so Continue unblocks.
 */
export const DebtPaymentField: React.FC<DebtPaymentFieldProps> = ({
  fieldName,
  schema,
  debtType,
  icon,
}) => {
  const { t } = useTranslation();
  const { error, helperText, ...fieldProps } = useQuestionnaireAutoSave({
    fieldName,
    schema,
  });

  const question = t(
    'What is your monthly payment for all of your {{debtType}}?',
    {
      debtType,
    },
  );

  const helperTextId = `${fieldName}-helper-text`;

  return (
    <FormControl error={error}>
      <OutlinedInput
        size="small"
        type="number"
        inputProps={{
          min: 0,
          inputMode: 'numeric',
          'aria-label': question,
          'aria-describedby': helperTextId,
        }}
        startAdornment={
          <InputAdornment position="start">{icon}</InputAdornment>
        }
        placeholder={question}
        sx={{
          'input::placeholder': {
            opacity: 0.7,
          },
        }}
        {...fieldProps}
      />

      <FormHelperText id={helperTextId}>
        {error
          ? helperText
          : t('Round to the nearest dollar. Please enter 0 if you have none.')}
      </FormHelperText>
    </FormControl>
  );
};
