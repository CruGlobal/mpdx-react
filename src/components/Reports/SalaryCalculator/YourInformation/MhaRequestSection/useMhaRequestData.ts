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

  const selfApprovedAmount =
    hcmUser?.mhaRequest?.currentApprovedOverallAmount ?? 0;
  const spouseApprovedAmount =
    hcmSpouse?.mhaRequest?.currentApprovedOverallAmount ?? 0;

  const selfApprovedAmountFormatted = useMemo(
    () => currencyFormat(selfApprovedAmount, 'USD', locale),
    [selfApprovedAmount, locale],
  );
  const spouseApprovedAmountFormatted = useMemo(
    () => currencyFormat(spouseApprovedAmount, 'USD', locale),
    [spouseApprovedAmount, locale],
  );

  const boardApprovedAmount = hasSpouse
    ? selfApprovedAmount + spouseApprovedAmount
    : selfApprovedAmount;

  const schema = useMemo(() => {
    const baseSchema = {
      mhaAmount: amount(t('New Requested MHA'), t)
        .max(
          selfApprovedAmount,
          t(
            `New Requested MHA cannot exceed Board Approved MHA Amount of ${selfApprovedAmountFormatted}`,
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
              `New Requested MHA cannot exceed Board Approved MHA Amount of ${spouseApprovedAmountFormatted}`,
            ),
          )
          .required(t('Spouse MHA Amount is required')),
      });
    }

    return yup.object(baseSchema);
  }, [t, hasSpouse, selfApprovedAmount, spouseApprovedAmount]);

  // Multiply by 24 to annualize the monthly amounts from HCM
  const currentAmountForStaff =
    (hcmUser?.mhaRequest?.currentTakenAmount ?? 0) * 24;
  const spouseCurrentAmountForStaff =
    (hcmSpouse?.mhaRequest?.currentTakenAmount ?? 0) * 24;

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
      boardApprovedAmount > 0
        ? (totalRequestedMhaValue / boardApprovedAmount) * 100
        : 0,
    [totalRequestedMhaValue, boardApprovedAmount],
  );

  const difference = useMemo(
    () => boardApprovedAmount - totalRequestedMhaValue,
    [boardApprovedAmount, totalRequestedMhaValue],
  );

  const currentTakenAmountFormatted = useMemo(
    () => currencyFormat(currentAmountForStaff, 'USD', locale),
    [currentAmountForStaff, locale],
  );
  const currentApprovedSpouseAmountForStaffFormatted = useMemo(
    () => currencyFormat(spouseCurrentAmountForStaff, 'USD', locale),
    [spouseCurrentAmountForStaff, locale],
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
    hasSpouse,
    schema,
    currentTakenAmount: currentTakenAmountFormatted,
    currentApprovedSpouseAmountForStaff:
      currentApprovedSpouseAmountForStaffFormatted,
    totalRequestedMhaValue: totalRequestedMhaFormatted,
    difference: differenceFormatted,
    boardApprovedAmount: boardApprovedAmountFormatted,
    progressPercentage,
  };
};
