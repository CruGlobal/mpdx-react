import React, { useMemo, useState } from 'react';
import CreditCard from '@mui/icons-material/CreditCard';
import DirectionsCar from '@mui/icons-material/DirectionsCar';
import School from '@mui/icons-material/School';
import {
  FormControlLabel,
  InputAdornment,
  Radio,
  RadioGroup,
} from '@mui/material';
import { TFunction, useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useSyncedState } from 'src/hooks/useSyncedState';
import { LabeledField } from '../Shared/LabeledField';
import { useNsoMpdQuestionnaire } from '../Shared/NsoMpdQuestionnaireContext';
import { NumberQuestion } from '../Shared/NumberQuestion';
import { getAmountSchema } from '../Shared/helpers/getAmountSchema';
import { QuestionnaireField } from '../Shared/useQuestionnaireAutoSave';

export const getDebtSchema = (t: TFunction) =>
  yup.object({
    studentLoanMonthlyPayment: getAmountSchema(t),
    carLoanMonthlyPayment: getAmountSchema(t),
    creditCardDebtMonthlyPayment: getAmountSchema(t),
  });

export const DebtQuestions: React.FC = () => {
  const { t } = useTranslation();

  const schema = useMemo(() => getDebtSchema(t), [t]);

  const { saveField, questionnaire } = useNsoMpdQuestionnaire();

  const {
    studentLoanMonthlyPayment,
    carLoanMonthlyPayment,
    creditCardDebtMonthlyPayment,
  } = questionnaire ?? {};

  // UI-only toggle, seeded from the saved debt fields
  const savedHasDebt = useMemo(() => {
    const debtAmounts = [
      studentLoanMonthlyPayment,
      carLoanMonthlyPayment,
      creditCardDebtMonthlyPayment,
    ];
    return debtAmounts.some((amount) => (amount ?? 0) > 0)
      ? 'Yes'
      : debtAmounts.every((amount) => amount === 0)
        ? 'No'
        : '';
  }, [
    studentLoanMonthlyPayment,
    carLoanMonthlyPayment,
    creditCardDebtMonthlyPayment,
  ]);
  const [hasDebt, setHasDebt] = useSyncedState(savedHasDebt);
  const [hasDebtTouched, setHasDebtTouched] = useState(false);
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
    <>
      <LabeledField
        required
        error={showHasDebtError}
        helperText={
          showHasDebtError ? t('Please select an answer.') : undefined
        }
        label={t('Do you have any student loan, car, or credit card debt?')}
      >
        {(aria) => (
          <RadioGroup
            row
            sx={{ paddingInline: 2 }}
            aria-required
            value={hasDebt}
            onChange={handleHasDebtChange}
            onBlur={() => setHasDebtTouched(true)}
            {...aria}
          >
            <FormControlLabel
              value="Yes"
              control={<Radio />}
              label={t('Yes')}
            />
            <FormControlLabel value="No" control={<Radio />} label={t('No')} />
          </RadioGroup>
        )}
      </LabeledField>

      {hasDebt === 'Yes' &&
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
    </>
  );
};
