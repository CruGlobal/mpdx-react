import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { amount } from 'src/lib/yupHelpers';
import { useSalaryCalculator } from '../../SalaryCalculatorContext/SalaryCalculatorContext';

export const useMhaRequestData = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { hcmUser, hcmSpouse, calculation } = useSalaryCalculator();

  const hasSpouse = !!hcmSpouse;

  const approvedAmount = hcmUser?.mhaRequest.currentApprovedOverallAmount;
  const approvedAmountFormatted = useMemo(
    () => currencyFormat(approvedAmount ?? 0, 'USD', locale),
    [approvedAmount, locale],
  );

  const schema = useMemo(() => {
    const mhaMaxMessage = t(
      'New Requested MHA cannot exceed Board Approved MHA Amount of {{amount}}',
      { amount: approvedAmountFormatted },
    );

    return yup.object({
      mhaAmount: amount(t('New Requested MHA'), t, {
        max: approvedAmount,
        maxMessage: mhaMaxMessage,
      }),
      spouseMhaAmount: amount(t('Spouse New Requested MHA'), t, {
        max: approvedAmount,
        maxMessage: mhaMaxMessage,
      }),
    });
  }, [t, approvedAmount, approvedAmountFormatted]);

  const currentTakenAmount = hcmUser?.mhaRequest.currentTakenAmount ?? 0;
  const currentSpouseTakenAmount =
    hcmSpouse?.mhaRequest.currentTakenAmount ?? 0;

  const newRequestedMhaValue = calculation?.mhaAmount ?? 0;
  const newRequestedSpouseMhaValue = calculation?.spouseMhaAmount ?? 0;
  const totalRequestedMhaValue = useMemo(
    () =>
      hasSpouse
        ? newRequestedMhaValue + newRequestedSpouseMhaValue
        : newRequestedMhaValue,
    [hasSpouse, newRequestedMhaValue, newRequestedSpouseMhaValue],
  );

  const progressPercentage = useMemo(
    () =>
      approvedAmount ? (totalRequestedMhaValue / approvedAmount) * 100 : 0,
    [totalRequestedMhaValue, approvedAmount],
  );

  const difference = useMemo(
    () => (approvedAmount ?? 0) - totalRequestedMhaValue,
    [approvedAmount, totalRequestedMhaValue],
  );

  const currentTakenAmountFormatted = useMemo(
    () => currencyFormat(currentTakenAmount, 'USD', locale),
    [currentTakenAmount, locale],
  );
  const currentSpouseTakenAmountFormatted = useMemo(
    () => currencyFormat(currentSpouseTakenAmount, 'USD', locale),
    [currentSpouseTakenAmount, locale],
  );
  const totalRequestedMhaFormatted = useMemo(
    () => currencyFormat(totalRequestedMhaValue, 'USD', locale),
    [totalRequestedMhaValue, locale],
  );
  const differenceFormatted = useMemo(
    () => currencyFormat(difference, 'USD', locale),
    [difference, locale],
  );

  return {
    hasSpouse,
    schema,
    currentTakenAmount: currentTakenAmountFormatted,
    currentSpouseTakenAmount: currentSpouseTakenAmountFormatted,
    totalRequestedMhaValue: totalRequestedMhaFormatted,
    difference: differenceFormatted,
    approvedAmount: approvedAmountFormatted,
    progressPercentage,
  };
};
