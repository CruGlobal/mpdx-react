import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';
import { useFormikContext } from 'formik';
import { useCustomAutoSave } from 'src/components/Reports/Shared/CalculationReports/CustomAutosave/useCustomAutosave';
import { PageEnum } from 'src/components/Reports/Shared/CalculationReports/Shared/sharedTypes';
import { CompleteFormValues } from '../../AdditionalSalaryRequest';
import { useAdditionalSalaryRequest } from '../AdditionalSalaryRequestContext';
import { useSaveField } from './useSaveField';

interface AutosaveCustomTextFieldProps
  extends Omit<
    TextFieldProps,
    'value' | 'onChange' | 'onBlur' | 'error' | 'helperText' | 'disabled'
  > {
  fieldName: keyof CompleteFormValues;
  variant?: 'filled' | 'outlined' | 'standard';
}

export const AutosaveCustomTextField: React.FC<
  AutosaveCustomTextFieldProps
> = ({ variant, fieldName, ...props }) => {
  const { pageType, requestData } = useAdditionalSalaryRequest();
  const request = requestData?.latestAdditionalSalaryRequest;
  const formikContext = useFormikContext<CompleteFormValues>();
  const {
    setFieldValue,
    setFieldTouched,
    submitCount,
    values: formValues,
    validationSchema: schema,
  } = formikContext;

  const saveField = useSaveField({ formValues });

  const stringFields = ['phoneNumber', 'emailAddress'];
  const isStringField = stringFields.includes(fieldName as string);

  const fieldValue = isStringField
    ? (request?.[fieldName] ?? formValues[fieldName])
    : request?.[fieldName];

  const fieldProps = useCustomAutoSave({
    value: fieldValue,
    saveValue: (value) => saveField({ [fieldName]: value }),
    fieldName: fieldName as string,
    schema,
    setFieldValue,
    setFieldTouched,
    submitCount,
    disabled: pageType === PageEnum.View,
    stringFields: [...stringFields, 'additionalInfo'],
  });

  return (
    <TextField
      variant={variant}
      {...fieldProps}
      {...props}
      FormHelperTextProps={{
        sx:
          fieldName === 'additionalInfo'
            ? { marginLeft: 0 }
            : { textAlign: 'center' },
        ...props.FormHelperTextProps,
      }}
    />
  );
};
