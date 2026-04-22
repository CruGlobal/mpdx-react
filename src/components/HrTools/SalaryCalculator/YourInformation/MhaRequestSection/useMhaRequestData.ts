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
  const { calculation, hcmUser, hcmSpouse, hasSpouse } = useSalaryCalculator();

  // User MHA eligibility and request status
  const userEligible = hcmUser?.mhaEit.mhaEligibility ?? false;
  const userHasApprovedMha = !!hcmUser?.mhaRequest.currentApprovedOverallAmount;
  const spouseEligible =
    hasSpouse && (hcmSpouse?.mhaEit.mhaEligibility ?? false);
  const spouseHasApprovedMha =
    !!hcmSpouse?.mhaRequest.currentApprovedOverallAmount;
  // Determine which fields should be shown
  const showUserFields = userEligible && userHasApprovedMha;
  const showSpouseFields = spouseEligible && spouseHasApprovedMha;

  const userPreferredName = hcmUser?.staffInfo.preferredName ?? '';
  const spousePreferredName = hcmSpouse?.staffInfo.preferredName ?? '';

  // Users from Italy apply for an MHI, and are ineligible
  const userCountry = hcmUser?.staffInfo.country ?? null;
  const spouseCountry = hcmSpouse?.staffInfo.country ?? null;

  const anyIneligible = !userEligible || (hasSpouse && !spouseEligible);

  // Show "no MHA" link when someone is eligible but has no approved MHA
  const anyEligibleWithoutApprovedMha =
    (userEligible && !userHasApprovedMha) ||
    (spouseEligible && !spouseHasApprovedMha);

  const approvedAmount = userHasApprovedMha
    ? (hcmUser?.mhaRequest.currentApprovedOverallAmount ?? 0)
    : (hcmSpouse?.mhaRequest.currentApprovedOverallAmount ?? 0);

  const approvedAmountFormatted = useMemo(
    () => currencyFormat(approvedAmount, 'USD', locale),
    [approvedAmount, locale],
  );

  const schema = useMemo(() => {
    const combinedMaxMessage = t(
      'Combined MHA amounts cannot exceed Board Approved MHA Amount of {{amount}}',
      { amount: approvedAmountFormatted },
    );
    const singleMaxMessage = t(
      'New Requested MHA cannot exceed Board Approved MHA Amount of {{amount}}',
      { amount: approvedAmountFormatted },
    );

    let mhaAmountField = amount(t('New Requested MHA'), t, {
      max: approvedAmount,
      maxMessage: singleMaxMessage,
    });
    let spouseMhaAmountField = amount(t('Spouse New Requested MHA'), t, {
      max: approvedAmount,
      maxMessage: singleMaxMessage,
    });

    if (showUserFields && showSpouseFields) {
      mhaAmountField = mhaAmountField.test(
        'combined-max',
        combinedMaxMessage,
        (value) =>
          (value ?? 0) + (calculation?.spouseMhaAmount ?? 0) <= approvedAmount,
      );
      spouseMhaAmountField = spouseMhaAmountField.test(
        'combined-max',
        combinedMaxMessage,
        (value) =>
          (value ?? 0) + (calculation?.mhaAmount ?? 0) <= approvedAmount,
      );
    }

    return yup.object({
      mhaAmount: mhaAmountField,
      spouseMhaAmount: spouseMhaAmountField,
    });
  }, [
    t,
    approvedAmount,
    approvedAmountFormatted,
    showUserFields,
    showSpouseFields,
    calculation?.mhaAmount,
    calculation?.spouseMhaAmount,
  ]);

  const currentTakenAmount = hcmUser?.mhaRequest.currentTakenAmount ?? 0;
  const currentSpouseTakenAmount =
    hcmSpouse?.mhaRequest.currentTakenAmount ?? 0;

  const newRequestedMhaValue = showUserFields
    ? (calculation?.mhaAmount ?? 0)
    : 0;
  const newRequestedSpouseMhaValue = showSpouseFields
    ? (calculation?.spouseMhaAmount ?? 0)
    : 0;
  const totalRequestedMhaValue = useMemo(
    () =>
      showSpouseFields
        ? newRequestedMhaValue + newRequestedSpouseMhaValue
        : newRequestedMhaValue,
    [showSpouseFields, newRequestedMhaValue, newRequestedSpouseMhaValue],
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
    schema,
    currentTakenAmount: currentTakenAmountFormatted,
    currentSpouseTakenAmount: currentSpouseTakenAmountFormatted,
    totalRequestedMhaValue: totalRequestedMhaFormatted,
    difference: differenceFormatted,
    approvedAmount: approvedAmountFormatted,
    progressPercentage,
    anyEligibleWithoutApprovedMha,
    showUserFields,
    showSpouseFields,
    userPreferredName,
    spousePreferredName,
    userEligible,
    spouseEligible,
    userCountry,
    spouseCountry,
    anyIneligible,
    hasSpouse,
  };
};
