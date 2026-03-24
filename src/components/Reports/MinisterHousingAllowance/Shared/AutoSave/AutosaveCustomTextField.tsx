import { TextField, TextFieldProps } from '@mui/material';
import { useFormikContext } from 'formik';
import * as yup from 'yup';
import { MinistryHousingAllowanceRequestAttributesInput } from 'pages/api/graphql-rest.page.generated';
import { PageEnum } from 'src/components/Reports/Shared/CalculationReports/Shared/sharedTypes';
import { useCustomAutoSave } from '../../../Shared/CalculationReports/CustomAutosave/useCustomAutosave';
import { CalculationFormValues } from '../../Steps/StepThree/Calculation';
import { useMinisterHousingAllowance } from '../Context/MinisterHousingAllowanceContext';
import { useSaveField } from './useSaveField';

export interface AutosaveCustomTextFieldProps
  extends Omit<
    TextFieldProps<'outlined' | 'standard'>,
    keyof ReturnType<typeof useCustomAutoSave> | 'variant'
  > {
  variant?: 'standard' | 'outlined';
  fieldName: keyof CalculationFormValues & string;
  additionalSaveFields?: Array<keyof CalculationFormValues & string>;
  schema: yup.Schema;
}

export const AutosaveCustomTextField: React.FC<
  AutosaveCustomTextFieldProps
> = ({ variant, fieldName, additionalSaveFields, schema, ...props }) => {
  const { pageType, requestData } = useMinisterHousingAllowance();
  const request = requestData?.requestAttributes;

  const {
    setFieldValue,
    setFieldTouched,
    submitCount,
    values: formValues,
  } = useFormikContext<CalculationFormValues>();

  const saveField = useSaveField({ formValues });

  /*
   * For additional fields to save,
   * call setFieldValue for those fields whenever the main field changes,
   * so that they are updated in formik state and included in validation
   */
  const wrappedSetFieldValue: typeof setFieldValue = (
    field,
    value,
    shouldValidate,
  ) => {
    setFieldValue(field, value, shouldValidate);
    if (field === fieldName && additionalSaveFields) {
      additionalSaveFields.forEach((additionalField) => {
        setFieldValue(additionalField, value, shouldValidate);
      });
    }
  };

  const fieldProps = useCustomAutoSave({
    value: request?.[fieldName],
    saveValue: (value) => {
      const attributes: Partial<MinistryHousingAllowanceRequestAttributesInput> =
        { [fieldName]: value };
      additionalSaveFields?.forEach((field) => {
        attributes[field] = value;
      });
      return saveField(attributes);
    },
    fieldName,
    schema,
    setFieldValue: wrappedSetFieldValue,
    setFieldTouched,
    submitCount,
    disabled: !request || pageType === PageEnum.View,
    stringFields: ['phoneNumber', 'emailAddress'],
  });

  return <TextField variant={variant} {...fieldProps} {...props} />;
};
