import React, { useEffect, useMemo, useState } from 'react';
import CreditCard from '@mui/icons-material/CreditCard';
import DirectionsCar from '@mui/icons-material/DirectionsCar';
import School from '@mui/icons-material/School';
import {
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  InputAdornment,
  Radio,
  RadioGroup,
  Stack,
} from '@mui/material';
import { TFunction, useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useOptionalAutosaveForm } from 'src/components/Shared/Autosave/AutosaveForm';
import { NumberQuestion } from '../Shared/NumberQuestion';
import { getAmountSchema } from '../Shared/helpers/getAmountSchema';

export const getFinancialDetailsSchema = (t: TFunction) =>
  yup.object({
    studentLoanPayment: getAmountSchema(t),
    carPayment: getAmountSchema(t),
    creditCardPayment: getAmountSchema(t),
  });

export const FinancialDetails: React.FC = () => {
  const { t } = useTranslation();

  const schema = useMemo(() => getFinancialDetailsSchema(t), [t]);

  // UI only toggle
  const [hasDebt, setHasDebt] = useState('');
  const showDebtFields = hasDebt === 'Yes';
  const hasDebtError = !hasDebt;

  const { markValid, markInvalid } = useOptionalAutosaveForm() ?? {};
  useEffect(() => {
    if (hasDebtError) {
      markInvalid?.('hasDebt');
    } else {
      markValid?.('hasDebt');
    }
    return () => markValid?.('hasDebt');
  }, [hasDebtError, markValid, markInvalid]);

  const debtFields = [
    {
      fieldName: 'studentLoanPayment',
      debtType: t('student loan debt'),
      icon: <School />,
    },
    {
      fieldName: 'carPayment',
      debtType: t('car debt'),
      icon: <DirectionsCar />,
    },
    {
      fieldName: 'creditCardPayment',
      debtType: t('credit card debt'),
      icon: <CreditCard />,
    },
  ];

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
          onChange={(event) => setHasDebt(event.target.value)}
        >
          <FormControlLabel value="Yes" control={<Radio />} label={t('Yes')} />
          <FormControlLabel value="No" control={<Radio />} label={t('No')} />
        </RadioGroup>
        {hasDebtError && (
          <FormHelperText>{t('Please select an answer.')}</FormHelperText>
        )}
      </FormControl>

      {showDebtFields &&
        debtFields.map(({ fieldName, debtType, icon }) => (
          <NumberQuestion
            key={fieldName}
            fieldName={fieldName}
            schema={schema}
            question={t(
              'What is your monthly payment for all of your {{debtType}}?',
              { debtType },
            )}
            helperText={t(
              'Round to the nearest dollar. Please enter 0 if you have none.',
            )}
            startAdornment={
              <InputAdornment position="start">{icon}</InputAdornment>
            }
          />
        ))}
    </Stack>
  );
};
