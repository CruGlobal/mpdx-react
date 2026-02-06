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

  // Only use spouse MHA data if the spouse exists in the salary calculator context

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

  const getNotEligibleName = () => {
    if (showUserIneligibleSpouseApprovedMessage) {
      return userPreferredName;
    }
    if (showSpouseIneligibleUserApprovedMessage) {
      return spousePreferredName;
    }
    return null;
  };
  const notEligibleName = getNotEligibleName();

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

    if (hcmSpouse) {
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
  }, [t, hcmSpouse, approvedAmount]);

  // Multiply by 24 to annualize the monthly amounts from HCM
  const currentAmountForStaff =
    (hcmUser?.mhaRequest.currentTakenAmount ?? 0) * 24;
  const spouseCurrentAmountForStaff =
    (hcmSpouse?.mhaRequest.currentTakenAmount ?? 0) * 24;

  const newRequestedMhaValue = calculation?.mhaAmount ?? 0;
  const newRequestedSpouseMhaValue = calculation?.spouseMhaAmount ?? 0;
  const totalRequestedMhaValue = useMemo(
    () =>
      hcmSpouse
        ? newRequestedMhaValue + newRequestedSpouseMhaValue
        : newRequestedMhaValue,
    [hcmSpouse, newRequestedMhaValue, newRequestedSpouseMhaValue],
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
    schema,
    currentTakenAmount: currentTakenAmountFormatted,
    currentSpouseTakenAmount: currentApprovedSpouseTakenAmountFormatted,
    totalRequestedMhaValue: totalRequestedMhaFormatted,
    difference: differenceFormatted,
    approvedAmount: approvedAmountFormatted,
    progressPercentage,
    showNoMhaMessage,
    isNoMhaPlural,
    noMhaNames,
    notEligibleName,
    showUserFields,
    showSpouseFields,
    userPreferredName,
    spousePreferredName,
    showIneligibleMessage,
    isIneligiblePlural,
    ineligibleNames,
  };
};
