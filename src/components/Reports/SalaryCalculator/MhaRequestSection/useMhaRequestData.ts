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

  const self = useMemo(() => hcm?.[0], [hcm]);
  const spouse = useMemo(() => hcm?.[1], [hcm]);
  const hasSpouse = hcm?.length === 2;

  const selfApprovedAmount =
    self?.mhaRequest?.currentApprovedOverallAmount ?? 0;
  const spouseApprovedAmount =
    spouse?.mhaRequest?.currentApprovedOverallAmount ?? 0;

  const boardApprovedAmount = hasSpouse
    ? selfApprovedAmount + spouseApprovedAmount
    : selfApprovedAmount;

  const schema = useMemo(() => {
    const baseSchema = {
      mhaAmount: amount(t('New Requested MHA'), t)
        .max(
          selfApprovedAmount,
          t(
            'New Requested MHA cannot exceed Board Approved MHA Amount of ${{selfApprovedAmount}}',
            { selfApprovedAmount },
          ),
        )
        .required(t('MHA Amount is required')),
    };

    if (hasSpouse) {
      return yup.object({
        ...baseSchema,
        spouseMhaAmount: amount(t('Spouse New Requested MHA'), t)
          .max(
            spouseApprovedAmount,
            t(
              'New Requested MHA cannot exceed Board Approved MHA Amount of ${{spouseApprovedAmount}}',
              { spouseApprovedAmount },
            ),
          )
          .required(t('Spouse MHA Amount is required')),
      });
    }

    return yup.object(baseSchema);
  }, [t, hasSpouse, selfApprovedAmount, spouseApprovedAmount]);

  //TODO: Pull MHA values from HCM that are based off the most recent paycheck (not the approved amount)
  const currentMhaValue = 0;
  const currentSpouseMhaValue = 0;

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
    () => (totalRequestedMhaValue / boardApprovedAmount) * 100,
    [totalRequestedMhaValue, boardApprovedAmount],
  );

  const difference = useMemo(
    () => boardApprovedAmount - totalRequestedMhaValue,
    [boardApprovedAmount, totalRequestedMhaValue],
  );

  const currentMhaFormatted = useMemo(
    () => currencyFormat(currentMhaValue, 'USD', locale),
    [currentMhaValue, locale],
  );
  const currentSpouseMhaFormatted = useMemo(
    () => currencyFormat(currentSpouseMhaValue, 'USD', locale),
    [currentSpouseMhaValue, locale],
  );
  const totalRequestedMhaFormatted = useMemo(
    () => currencyFormat(totalRequestedMhaValue, 'USD', locale),
    [totalRequestedMhaValue, locale],
  );
  const boardApprovedAmountFormatted = useMemo(
    () => currencyFormat(boardApprovedAmount, 'USD', locale),
    [boardApprovedAmount, locale],
  );
  const differenceFormatted = useMemo(
    () => currencyFormat(difference, 'USD', locale),
    [difference, locale],
  );

  return {
    self,
    spouse,
    hasSpouse,
    schema,
    boardApprovedAmount,
    currentMhaFormatted,
    currentSpouseMhaFormatted,
    newRequestedMhaValue,
    newRequestedSpouseMhaValue,
    totalRequestedMhaValue: totalRequestedMhaFormatted,
    differenceFormatted,
    boardApprovedAmountFormatted,
    progressPercentage,
  };
};
