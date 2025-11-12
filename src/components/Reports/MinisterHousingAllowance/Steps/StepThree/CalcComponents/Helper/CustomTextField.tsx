import { useState } from 'react';
import { TextField } from '@mui/material';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { CalculationFormValues } from '../../Calculation';
import { display, parseInput } from './formatHelper';

interface CustomTextFieldProps {
  name: keyof CalculationFormValues & string;
  value: number | null | undefined;
}

export const CustomTextField: React.FC<CustomTextFieldProps> = ({
  name,
  value,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const currency = 'USD';

  const [focused, setFocused] = useState<string | null>(null);
  const isEditing = (name: keyof CalculationFormValues & string) =>
    focused === name;

  const { touched, errors, setFieldValue, handleBlur } =
    useFormikContext<CalculationFormValues>();

  return (
    <TextField
      variant="standard"
      name={name}
      value={display(isEditing, name, value, currency, locale)}
      onFocus={() => setFocused(name)}
      onChange={(e) => setFieldValue(name, parseInput(e.target.value))}
      onBlur={(e) => {
        if (focused === name) {
          setFocused(null);
        }
        handleBlur(e);
      }}
      InputProps={{ disableUnderline: true, inputMode: 'decimal' }}
      error={touched[name] && Boolean(errors[name])}
      helperText={touched[name] && errors[name]}
      placeholder={t('Enter Amount')}
    />
  );
};
