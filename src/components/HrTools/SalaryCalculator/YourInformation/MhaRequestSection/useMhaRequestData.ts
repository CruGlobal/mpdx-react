import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import {
  getEffectiveEligibility,
  getHousingKind,
  getMhiEligibility,
} from 'src/components/Reports/Shared/HousingAllowance/housingAllowance';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { amount } from 'src/lib/yupHelpers';
import { useSalaryCalculator } from '../../SalaryCalculatorContext/SalaryCalculatorContext';

export const useMhaRequestData = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { calculation, hcmUser, hcmSpouse, hasSpouse } = useSalaryCalculator();

  // Effective eligibility: MHI flag for Italian staff, MHA flag otherwise.
  const userEligible = getEffectiveEligibility(hcmUser);
  const userHasApprovedMha = !!hcmUser?.mhaRequest.currentApprovedOverallAmount;
  const spouseEligible = hasSpouse && getEffectiveEligibility(hcmSpouse);
  const spouseHasApprovedMha =
    !!hcmSpouse?.mhaRequest.currentApprovedOverallAmount;
  // Determine which fields should be shown
  const showUserFields = userEligible && userHasApprovedMha;
  const showSpouseFields = spouseEligible && spouseHasApprovedMha;

  const userPreferredName = hcmUser?.staffInfo.preferredName ?? '';
  const spousePreferredName = hcmSpouse?.staffInfo.preferredName ?? '';

  const userCountry = hcmUser?.staffInfo.country ?? null;
  const spouseCountry = hcmSpouse?.staffInfo.country ?? null;
  const userKind = getHousingKind(userCountry);
  const spouseKind = getHousingKind(spouseCountry);
  const userMhiEligibility = getMhiEligibility(hcmUser);
  const spouseMhiEligibility = getMhiEligibility(hcmSpouse);

  const anyIneligible = !userEligible || (hasSpouse && !spouseEligible);

  // Show "no MHA" link when someone is eligible but has no approved MHA
  const anyEligibleWithoutApprovedMha =
    (userEligible && !userHasApprovedMha) ||
    (spouseEligible && !spouseHasApprovedMha);

  // For Italian (MHI) staff the backend stores the approved MHI amount in
  // `mhaRequest.currentApprovedOverallAmount` — there is no separate
  // `mhiRequest` field. This one value is the approved amount for whichever
  // kind (MHA or MHI) applies to the person.
  const approvedAmount = userHasApprovedMha
    ? (hcmUser?.mhaRequest.currentApprovedOverallAmount ?? 0)
    : (hcmSpouse?.mhaRequest.currentApprovedOverallAmount ?? 0);

  const approvedAmountFormatted = useMemo(
    () => currencyFormat(approvedAmount, 'USD', locale),
    [approvedAmount, locale],
  );

  // Validation messages follow the same per-kind labeling as the UI.
  const sectionKind =
    showSpouseFields && !showUserFields ? spouseKind : userKind;

  const schema = useMemo(() => {
    const combinedMaxMessage = t(
      'Combined {{kind}} amounts cannot exceed Board Approved {{kind}} Amount of {{amount}}',
      { kind: sectionKind, amount: approvedAmountFormatted },
    );
    const userSingleMaxMessage = t(
      'New Requested {{kind}} cannot exceed Board Approved {{kind}} Amount of {{amount}}',
      { kind: userKind, amount: approvedAmountFormatted },
    );
    const spouseSingleMaxMessage = t(
      'New Requested {{kind}} cannot exceed Board Approved {{kind}} Amount of {{amount}}',
      { kind: spouseKind, amount: approvedAmountFormatted },
    );

    const mhaAmountBase = amount(
      t('New Requested {{kind}}', { kind: userKind }),
      t,
      { max: approvedAmount, maxMessage: userSingleMaxMessage },
    );
    const spouseMhaAmountBase = amount(
      t('Spouse New Requested {{kind}}', { kind: spouseKind }),
      t,
      { max: approvedAmount, maxMessage: spouseSingleMaxMessage },
    );

    const applyCombinedMax = showUserFields && showSpouseFields;
    const mhaAmountField = applyCombinedMax
      ? mhaAmountBase.test(
          'combined-max',
          combinedMaxMessage,
          (value) =>
            (value ?? 0) + (calculation?.spouseMhaAmount ?? 0) <=
            approvedAmount,
        )
      : mhaAmountBase;
    const spouseMhaAmountField = applyCombinedMax
      ? spouseMhaAmountBase.test(
          'combined-max',
          combinedMaxMessage,
          (value) =>
            (value ?? 0) + (calculation?.mhaAmount ?? 0) <= approvedAmount,
        )
      : spouseMhaAmountBase;

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
    userKind,
    spouseKind,
    sectionKind,
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
    userKind,
    spouseKind,
    userMhiEligibility,
    spouseMhiEligibility,
    anyIneligible,
    hasSpouse,
  };
};
