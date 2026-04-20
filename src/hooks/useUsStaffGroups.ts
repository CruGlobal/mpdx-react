import { useMemo } from 'react';
import { useHcmQuery } from 'src/components/Reports/Shared/HcmData/Hcm.generated';

/**
 * This hook determines whether a US Staff user is in a subgroup that's ineligible for ASR or Salary Calculator.
 * The ASR check runs against the ASR-eligible person (logged-in user if eligible, otherwise spouse, otherwise the logged-in user).
 * The Salary Calculator check always runs against the logged-in user.
 */
export function useUsStaffGroups(skip?: boolean) {
  const { data, loading } = useHcmQuery({
    skip,
  });
  const [user, spouse] = data?.hcm ?? [];

  const eligibleUser = user?.asrEit?.asrEligibility
    ? user
    : spouse?.asrEit?.asrEligibility
      ? spouse
      : user;

  const inAsrIneligibleGroup = eligibleUser?.asrEit?.asrEligibility === false;
  const inSalaryCalcIneligibleGroup = user?.salaryRequestEligible === false;

  return useMemo(
    () => ({
      inAsrIneligibleGroup,
      inSalaryCalcIneligibleGroup,
      loading: loading && !data,
    }),
    [inAsrIneligibleGroup, inSalaryCalcIneligibleGroup, loading, data],
  );
}
