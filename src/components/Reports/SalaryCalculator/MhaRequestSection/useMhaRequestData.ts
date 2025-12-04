import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { amount } from 'src/lib/yupHelpers';
import { useSalaryCalculator } from '../SalaryCalculatorContext/SalaryCalculatorContext';

export const useMhaRequestData = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { calculation, hcm } = useSalaryCalculator();

  const hasSpouse = hcm?.length === 2;

  // TODO: Get actual values from API
  const boardApprovedAmount = hasSpouse ? 20000 : 12000;

  const schema = useMemo(
    () =>
      yup.object({
        mhaAmount: amount(t('New Requested MHA'), t).max(
          boardApprovedAmount,
          t(
            'New Requested MHA cannot exceed Board Approved MHA Amount of ${{boardApprovedAmount}}',
            { boardApprovedAmount },
          ),
        ),
        spouseMhaAmount: amount(t('Spouse New Requested MHA'), t).max(
          boardApprovedAmount,
          t(
            'New Requested MHA cannot exceed Board Approved MHA Amount of ${{boardApprovedAmount}}',
            { boardApprovedAmount },
          ),
        ),
      }),
    [t, boardApprovedAmount],
  );

  // TODO: Add mhaAmount field to HCM query and use: hcm?.[0]?.currentSalary?.mhaAmount ?? 0
  const currentMhaValue = 0;
  const currentSpouseMhaValue = 0;
  const newRequestedMhaValue = calculation?.mhaAmount ?? 0;
  const newRequestedSpouseMhaValue = calculation?.spouseMhaAmount ?? 0;
  const totalRequestedMhaValue = hasSpouse
    ? newRequestedMhaValue + newRequestedSpouseMhaValue
    : newRequestedMhaValue;
  const progressPercentage =
    boardApprovedAmount > 0
      ? Math.min((totalRequestedMhaValue / boardApprovedAmount) * 100, 100)
      : 0;

  const self = hcm?.[0];
  const spouse = hcm?.[1];

  // Formatted values with trailing zeroes
  const currentMhaFormatted = currencyFormat(currentMhaValue, 'USD', locale);
  const currentSpouseMhaFormatted = currencyFormat(
    currentSpouseMhaValue,
    'USD',
    locale,
  );
  const totalRequestedMhaFormatted = currencyFormat(
    totalRequestedMhaValue,
    'USD',
    locale,
  );
  const boardApprovedAmountFormatted = currencyFormat(
    boardApprovedAmount,
    'USD',
    locale,
  );

  return {
    hasSpouse,
    boardApprovedAmount,
    schema,
    currentMhaValue: currentMhaFormatted,
    currentSpouseMhaValue: currentSpouseMhaFormatted,
    newRequestedMhaValue,
    newRequestedSpouseMhaValue,
    totalRequestedMhaValue: totalRequestedMhaFormatted,
    boardApprovedAmountFormatted,
    progressPercentage,
    self,
    spouse,
  };
};
