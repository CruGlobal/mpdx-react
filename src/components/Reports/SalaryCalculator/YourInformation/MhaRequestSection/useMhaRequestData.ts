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

  // User MHA eligibility and request status
  const userEligibleForMha = hcmUser?.mhaEit.mhaEligibility ?? false;
  const userHasMhaRequest =
    (hcmUser?.mhaRequest.currentApprovedOverallAmount ?? 0) > 0;

  // Spouse MHA eligibility and request status
  const spouseEligibleForMha = hcmSpouse?.mhaEit.mhaEligibility ?? false;
  const spouseHasMhaRequest =
    (hcmSpouse?.mhaRequest.currentApprovedOverallAmount ?? 0) > 0;

  // Show MHA section if either user or spouse is eligible
  const showMhaSection = userEligibleForMha || spouseEligibleForMha;

  // Show form if at least one eligible person has an MHA request
  const showMhaForm =
    (userEligibleForMha && userHasMhaRequest) ||
    (spouseEligibleForMha && spouseHasMhaRequest);

  // Show "no MHA" message for eligible people who don't have an MHA
  const showUserNoMhaMessage = userEligibleForMha && !userHasMhaRequest;
  const showSpouseNoMhaMessage =
    hasSpouse && spouseEligibleForMha && !spouseHasMhaRequest;

  // Determine which fields should be shown/editable
  const showUserFields = userEligibleForMha && userHasMhaRequest;
  const showSpouseFields =
    hasSpouse && spouseEligibleForMha && spouseHasMhaRequest;

  const userPreferredName = hcmUser?.staffInfo.preferredName ?? '';
  const spousePreferredName = hcmSpouse?.staffInfo.preferredName ?? '';

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

  // Multiply by 24 to annualize the monthly amounts from HCM
  const currentAmountForStaff =
    (hcmUser?.mhaRequest.currentTakenAmount ?? 0) * 24;
  const spouseCurrentAmountForStaff =
    (hcmSpouse?.mhaRequest.currentTakenAmount ?? 0) * 24;

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
    showMhaSection,
    showMhaForm,
    showUserNoMhaMessage,
    showSpouseNoMhaMessage,
    showUserFields,
    showSpouseFields,
    userPreferredName,
    spousePreferredName,
  };
};
