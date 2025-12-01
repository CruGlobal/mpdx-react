import { TextField, TextFieldProps } from '@mui/material';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { PageEnum } from 'src/components/Reports/Shared/CalculationReports/Shared/sharedTypes';
import { CalculationFormValues } from '../../Steps/StepThree/Calculation';
import { useMinisterHousingAllowance } from '../Context/MinisterHousingAllowanceContext';
import { useAutoSave } from './useAutosave';
import { useSaveField } from './useSaveField';

export interface AutosaveCustomTextFieldProps
  extends Omit<
    TextFieldProps<'outlined'>,
    keyof ReturnType<typeof useAutoSave> | 'variant'
  > {
  fieldName: keyof CalculationFormValues & string;
  schema: yup.Schema;
}

export const AutosaveCustomTextField: React.FC<
  AutosaveCustomTextFieldProps
> = ({ fieldName, schema, ...props }) => {
  const { t } = useTranslation();
  const { pageType, requestData } = useMinisterHousingAllowance();
  const request = requestData?.requestAttributes;

  const { setFieldValue, setFieldTouched, submitCount } =
    useFormikContext<CalculationFormValues>();

  const saveField = useSaveField();

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

  return (
    <TextField
      fullWidth
      size="small"
      variant="standard"
      placeholder={t('Enter Amount')}
      InputProps={{ disableUnderline: true, inputMode: 'decimal' }}
      {...fieldProps}
      {...props}
    />
  );
};
