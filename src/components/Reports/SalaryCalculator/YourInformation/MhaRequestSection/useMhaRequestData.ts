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
  const { calculation, hcmUser, hcmSpouse } = useSalaryCalculator();

  // User MHA eligibility and request status
  const userEligible = hcmUser?.mhaEit.mhaEligibility ?? false;
  const userHasApprovedMha = !!hcmUser?.mhaRequest.currentApprovedOverallAmount;

  // Spouse MHA eligibility and request status
  const spouseEligible = hcmSpouse?.mhaEit.mhaEligibility ?? false;
  const spouseHasApprovedMha =
    !!hcmSpouse?.mhaRequest.currentApprovedOverallAmount;
  // Show "no MHA" message for eligible people who don't have an MHA
  const showUserNoMhaMessage = userEligible && !userHasApprovedMha;
  const showSpouseNoMhaMessage = spouseEligible && !spouseHasApprovedMha;

  // Show "not eligible" message when one person is not eligible but the other has MHA
  const showUserIneligibleSpouseApprovedMessage =
    !userEligible && spouseEligible && spouseHasApprovedMha;
  const showSpouseIneligibleUserApprovedMessage =
    !spouseEligible && userEligible && userHasApprovedMha;
  // Determine which fields should be shown
  const showUserFields = userEligible && userHasApprovedMha;
  const showSpouseFields = spouseEligible && spouseHasApprovedMha;

  const userPreferredName = hcmUser?.staffInfo.preferredName ?? '';
  const spousePreferredName = hcmSpouse?.staffInfo.preferredName ?? '';

  // Computed text values for the component
  const showNoMhaMessage = showUserNoMhaMessage || showSpouseNoMhaMessage;
  const isNoMhaPlural = showUserNoMhaMessage && showSpouseNoMhaMessage;

  const getNoMhaNames = () => {
    if (isNoMhaPlural) {
      return t('{{userPreferredName}} and {{spousePreferredName}}', {
        userPreferredName,
        spousePreferredName,
      });
    }
    return showUserNoMhaMessage ? userPreferredName : spousePreferredName;
  };
  const noMhaNames = getNoMhaNames();

  const getIneligibleName = () => {
    if (showUserIneligibleSpouseApprovedMessage) {
      return userPreferredName;
    }
    if (showSpouseIneligibleUserApprovedMessage) {
      return spousePreferredName;
    }
    return null;
  };
  const ineligibleName = getIneligibleName();

  // Ineligibility messages (for NoMhaSubmitMessage)
  const showUserIneligibleMessage = !userEligible;
  const showSpouseIneligibleMessage = !spouseEligible;
  const showIneligibleMessage =
    showUserIneligibleMessage || showSpouseIneligibleMessage;
  const isIneligiblePlural =
    showUserIneligibleMessage && showSpouseIneligibleMessage;

  const getIneligibleNames = () => {
    if (isIneligiblePlural) {
      return t('{{userPreferredName}} and {{spousePreferredName}}', {
        userPreferredName,
        spousePreferredName,
      });
    }
    return showUserIneligibleMessage ? userPreferredName : spousePreferredName;
  };
  const ineligibleNames = showIneligibleMessage ? getIneligibleNames() : '';

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
    showNoMhaMessage,
    isNoMhaPlural,
    noMhaNames,
    ineligibleName,
    showUserFields,
    showSpouseFields,
    userPreferredName,
    spousePreferredName,
    showIneligibleMessage,
    isIneligiblePlural,
    ineligibleNames,
  };
};
