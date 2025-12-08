import { TextField, TextFieldProps } from '@mui/material';
import { useFormikContext } from 'formik';
import * as yup from 'yup';
import { PageEnum } from 'src/components/Reports/Shared/CalculationReports/Shared/sharedTypes';
import { CalculationFormValues } from '../../Steps/StepThree/Calculation';
import { useMinisterHousingAllowance } from '../Context/MinisterHousingAllowanceContext';
import { useAutoSave } from './useAutosave';
import { useSaveField } from './useSaveField';

export interface AutosaveCustomTextFieldProps
  extends Omit<
    TextFieldProps<'outlined' | 'standard'>,
    keyof ReturnType<typeof useAutoSave> | 'variant'
  > {
  variant?: 'standard' | 'outlined';
  fieldName: keyof CalculationFormValues & string;
  schema: yup.Schema;
}

export const AutosaveCustomTextField: React.FC<
  AutosaveCustomTextFieldProps
> = ({ variant, fieldName, schema, ...props }) => {
  const { pageType, requestData } = useMinisterHousingAllowance();
  const request = requestData?.requestAttributes;

  const {
    setFieldValue,
    setFieldTouched,
    submitCount,
    values: formValues,
  } = useFormikContext<CalculationFormValues>();

  const saveField = useSaveField({ formValues });

  const fieldProps = useAutoSave({
    value: request?.[fieldName],
    saveValue: (value) => saveField({ [fieldName]: value }),
    fieldName,
    schema,
    setFieldValue,
    setFieldTouched,
    submitCount,
    disabled: !request || pageType === PageEnum.View,
  });

  return <TextField variant={variant} {...fieldProps} {...props} />;
};
