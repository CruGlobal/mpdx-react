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

  const approvedAmount = hcmUser?.mhaRequest.currentApprovedOverallAmount ?? 0;
  const approvedAmountFormatted = useMemo(
    () => currencyFormat(approvedAmount, 'USD', locale),
    [approvedAmount, locale],
  );

  const schema = useMemo(() => {
    const baseSchema = {
      mhaAmount: amount(t('New Requested MHA'), t)
        .max(
          approvedAmount,
          t(
            'New Requested MHA cannot exceed Board Approved MHA Amount of {{amount}}',
            { amount: approvedAmountFormatted },
          ),
        )
        .required(t('MHA Amount is required')),
    };

    if (hasSpouse) {
      return yup.object({
        ...baseSchema,
        spouseMhaAmount: amount(t('Spouse New Requested MHA'), t)
          .max(
            approvedAmount,
            t(
              'New Requested MHA cannot exceed Board Approved MHA Amount of {{amount}}',
              { amount: approvedAmountFormatted },
            ),
          )
          .required(t('Spouse MHA Amount is required')),
      });
    }

    return yup.object(baseSchema);
  }, [t, hasSpouse, approvedAmount]);

  const currentAmountForStaff = hcmUser?.mhaRequest.currentTakenAmount ?? 0;
  const spouseCurrentAmountForStaff =
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
      approvedAmount > 0 ? (totalRequestedMhaValue / approvedAmount) * 100 : 0,
    [totalRequestedMhaValue, approvedAmount],
  );

  const difference = useMemo(
    () => approvedAmount - totalRequestedMhaValue,
    [approvedAmount, totalRequestedMhaValue],
  );

  const currentTakenAmountFormatted = useMemo(
    () => currencyFormat(currentAmountForStaff, 'USD', locale),
    [currentAmountForStaff, locale],
  );
  const currentApprovedSpouseTakenAmountFormatted = useMemo(
    () => currencyFormat(spouseCurrentAmountForStaff, 'USD', locale),
    [spouseCurrentAmountForStaff, locale],
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
    currentSpouseTakenAmount: currentApprovedSpouseTakenAmountFormatted,
    totalRequestedMhaValue: totalRequestedMhaFormatted,
    difference: differenceFormatted,
    approvedAmount: approvedAmountFormatted,
    progressPercentage,
  };
};
