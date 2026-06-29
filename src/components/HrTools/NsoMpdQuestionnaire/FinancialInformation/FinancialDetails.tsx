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
import { useSyncedState } from 'src/hooks/useSyncedState';
import { useNsoMpdQuestionnaire } from '../Shared/NsoMpdQuestionnaireContext';
import { NumberQuestion } from '../Shared/NumberQuestion';
import { getAmountSchema } from '../Shared/helpers/getAmountSchema';
import { QuestionnaireField } from '../Shared/useQuestionnaireAutoSave';

export const getFinancialDetailsSchema = (t: TFunction) =>
  yup.object({
    studentLoanMonthlyPayment: getAmountSchema(t),
    carLoanMonthlyPayment: getAmountSchema(t),
    creditCardDebtMonthlyPayment: getAmountSchema(t),
  });

export const FinancialDetails: React.FC = () => {
  const { t } = useTranslation();

  const schema = useMemo(() => getFinancialDetailsSchema(t), [t]);

  const { saveField, questionnaire } = useNsoMpdQuestionnaire();

  // UI-only toggle, seeded from the saved debt fields
  const savedHasDebt = useMemo(() => {
    const debtAmounts = [
      questionnaire?.studentLoanMonthlyPayment,
      questionnaire?.carLoanMonthlyPayment,
      questionnaire?.creditCardDebtMonthlyPayment,
    ];
    return debtAmounts.some((amount) => (amount ?? 0) > 0)
      ? 'Yes'
      : debtAmounts.every((amount) => amount === 0)
        ? 'No'
        : '';
  }, [
    questionnaire?.studentLoanMonthlyPayment,
    questionnaire?.carLoanMonthlyPayment,
    questionnaire?.creditCardDebtMonthlyPayment,
  ]);
  const [hasDebt, setHasDebt] = useSyncedState(savedHasDebt);
  const [hasDebtTouched, setHasDebtTouched] = useState(false);
  const showDebtFields = hasDebt === 'Yes';
  const hasDebtError = !hasDebt;
  const showHasDebtError = hasDebtError && hasDebtTouched;

  const handleHasDebtChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setHasDebt(value);
    if (value === 'No') {
      saveField({
        studentLoanMonthlyPayment: 0,
        carLoanMonthlyPayment: 0,
        creditCardDebtMonthlyPayment: 0,
      });
    }
  };

  const { markValid, markInvalid } = useOptionalAutosaveForm() ?? {};
  useEffect(() => {
    if (hasDebtError) {
      markInvalid?.('hasDebt');
    } else {
      markValid?.('hasDebt');
    }
    return () => markValid?.('hasDebt');
  }, [hasDebtError, markValid, markInvalid]);

  const debtFields: {
    fieldName: QuestionnaireField;
    debtType: string;
    icon: React.ReactNode;
  }[] = [
    {
      fieldName: 'studentLoanMonthlyPayment',
      debtType: t('student loan debt'),
      icon: <School />,
    },
    {
      fieldName: 'carLoanMonthlyPayment',
      debtType: t('car debt'),
      icon: <DirectionsCar />,
    },
    {
      fieldName: 'creditCardDebtMonthlyPayment',
      debtType: t('credit card debt'),
      icon: <CreditCard />,
    },
  ];

  return (
    <Stack spacing={4}>
      <FormControl error={showHasDebtError}>
        <FormLabel id="has-debt-label" sx={{ color: 'text.primary' }}>
          {t('Do you have any student loan, car, or credit card debt?')}
        </FormLabel>
        <RadioGroup
          row
          sx={{ paddingInline: 2 }}
          aria-labelledby="has-debt-label"
          value={hasDebt}
          onChange={handleHasDebtChange}
          onBlur={() => setHasDebtTouched(true)}
        >
          <FormControlLabel value="Yes" control={<Radio />} label={t('Yes')} />
          <FormControlLabel value="No" control={<Radio />} label={t('No')} />
        </RadioGroup>
        {showHasDebtError && (
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
