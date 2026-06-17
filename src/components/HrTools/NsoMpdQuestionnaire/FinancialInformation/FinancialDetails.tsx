import React, { useMemo } from 'react';
import CreditCard from '@mui/icons-material/CreditCard';
import DirectionsCar from '@mui/icons-material/DirectionsCar';
import School from '@mui/icons-material/School';
import {
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
} from '@mui/material';
import { TFunction, useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useQuestionnaireAutoSave } from '../Shared/useQuestionnaireAutoSave';
import { DebtPaymentField } from './DebtPaymentField';

export const getAmountSchema = (t: TFunction): yup.StringSchema =>
  yup
    .string()
    // Normalize leading zeros
    .transform((value) =>
      typeof value === 'string' ? value.replace(/^0+(?=\d)/, '') : value,
    )
    .matches(/^[^-]/, t('Please enter a positive amount.'))
    .matches(/^\d+$/, t('Please enter a whole dollar amount.'))
    .required(t('Please enter an amount, or 0 if you have none.'));

export const getFinancialDetailsSchema = (t: TFunction) =>
  yup.object({
    hasDebt: yup.string().required(t('Please select an answer.')),
    studentLoanPayment: getAmountSchema(t),
    carPayment: getAmountSchema(t),
    creditCardPayment: getAmountSchema(t),
  });

export const FinancialDetails: React.FC = () => {
  const { t } = useTranslation();

  const schema = useMemo(() => getFinancialDetailsSchema(t), [t]);

  const {
    value: hasDebt,
    error: hasDebtError,
    helperText: hasDebtHelperText,
    ...hasDebtProps
  } = useQuestionnaireAutoSave({
    fieldName: 'hasDebt',
    schema,
    saveOnChange: true,
  });

  const showDebtFields = hasDebt === 'Yes';

  return (
    <Stack spacing={4}>
      <FormControl error={hasDebtError}>
        <FormLabel id="has-debt-label" sx={{ color: 'text.primary' }}>
          {t('Do you have any student loan, car, or credit card debt?')}
        </FormLabel>
        <RadioGroup
          row
          sx={{ paddingInline: 2 }}
          aria-labelledby="has-debt-label"
          value={hasDebt}
          {...hasDebtProps}
        >
          <FormControlLabel value="Yes" control={<Radio />} label={t('Yes')} />
          <FormControlLabel value="No" control={<Radio />} label={t('No')} />
        </RadioGroup>
        {hasDebtHelperText && (
          <FormHelperText>{hasDebtHelperText}</FormHelperText>
        )}
      </FormControl>

      {showDebtFields && (
        <>
          <DebtPaymentField
            fieldName="studentLoanPayment"
            schema={schema}
            debtType={t('student loan debt')}
            icon={<School />}
          />
          <DebtPaymentField
            fieldName="carPayment"
            schema={schema}
            debtType={t('car debt')}
            icon={<DirectionsCar />}
          />
          <DebtPaymentField
            fieldName="creditCardPayment"
            schema={schema}
            debtType={t('credit card debt')}
            icon={<CreditCard />}
          />
        </>
      )}
    </Stack>
  );
};
