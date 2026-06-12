import { useMemo } from 'react';
import { useGetUserQuery } from 'src/components/User/GetUser.generated';
import {
  UsStaffGroupEnum,
  UserPersonTypeEnum,
} from 'src/graphql/types.generated';
import { HcmQuery, useHcmQuery } from '../../Shared/HcmData/Hcm.generated';

type HcmPerson = HcmQuery['hcm'][number];

/**
 * The household staffing scenario, derived from each person's staff group and whether the spouse is
 * non-RMO (SOSA). Forms switch on this instead of re-combining the underlying statuses. Combinations
 * outside the questionnaire's audience (e.g. a senior user who is single or married to senior staff
 * — they have no new-staff member to fill this out for) collapse to `Unknown`.
 */
export enum NsoMpdScenarioEnum {
  NewUserSingle = 'new-user-single',
  NewSosaUser = 'new-sosa-user',
  NewUserNewSpouse = 'new-user-new-spouse',
  NewUserSeniorSpouse = 'new-user-senior-spouse',
  SeniorUserNewSpouse = 'senior-user-new-spouse',
  Unknown = 'unknown',
}

export interface HouseholdStaff {
  /** The logged-in user's HCM record (hcm[0]). */
  hcmUser: HcmPerson | null;
  /** The spouse's HCM record (hcm[1]), or null when single. */
  hcmSpouse: HcmPerson | null;
  /** Whether the household includes a spouse. */
  hasSpouse: boolean;
  /** The user's staff group (New vs Senior, etc.), from GetUser. */
  userStaffGroup: UsStaffGroupEnum | null;
  /** The spouse's staff group, from GetUser. */
  spouseStaffGroup: UsStaffGroupEnum | null;
  /** Whether the user's spouse is non-RMO (SOSA). */
  hasNonRmoSpouse: boolean;
  /** The derived household scenario the forms switch on. */
  scenario: NsoMpdScenarioEnum;
  loading: boolean;
}

interface DeriveScenarioArguments {
  loading: boolean;
  hasSpouse: boolean;
  userStaffGroup: UsStaffGroupEnum | null;
  spouseStaffGroup: UsStaffGroupEnum | null;
  hasNonRmoSpouse: boolean;
}

const deriveScenario = ({
  loading,
  hasSpouse,
  userStaffGroup,
  spouseStaffGroup,
  hasNonRmoSpouse,
}: DeriveScenarioArguments): NsoMpdScenarioEnum => {
  if (loading) {
    return NsoMpdScenarioEnum.Unknown;
  }

  const userIsNew = userStaffGroup === UsStaffGroupEnum.NewStaff;
  const userIsSenior = userStaffGroup === UsStaffGroupEnum.SeniorStaff;
  const spouseIsNew = spouseStaffGroup === UsStaffGroupEnum.NewStaff;
  const spouseIsSenior = spouseStaffGroup === UsStaffGroupEnum.SeniorStaff;

  if (!hasSpouse) {
    return userIsNew
      ? NsoMpdScenarioEnum.NewUserSingle
      : NsoMpdScenarioEnum.Unknown;
  }
  if (hasNonRmoSpouse) {
    return userIsNew
      ? NsoMpdScenarioEnum.NewSosaUser
      : NsoMpdScenarioEnum.Unknown;
  }
  if (userIsNew && spouseIsNew) {
    return NsoMpdScenarioEnum.NewUserNewSpouse;
  }
  if (userIsNew && spouseIsSenior) {
    return NsoMpdScenarioEnum.NewUserSeniorSpouse;
  }
  if (userIsSenior && spouseIsNew) {
    return NsoMpdScenarioEnum.SeniorUserNewSpouse;
  }
  return NsoMpdScenarioEnum.Unknown;
};

/**
 * Pulls the household's HCM records and derives each person's staffing status for the NSO MPD
 * Questionnaire. New-vs-Senior comes from the API-computed `usStaffGroup`/`spouseUsStaffGroup` from
 * GetUser. The non-RMO-spouse (SOSA) marker is read from the user's own HCM `userPersonType`. The
 * derived `scenario` is what forms switch on so they don't re-combine the statuses themselves.
 */
export const useHouseholdStaff = (): HouseholdStaff => {
  const { data: hcmData, loading: hcmLoading } = useHcmQuery();
  const { data: userData, loading: userLoading } = useGetUserQuery();

  return useMemo(() => {
    const hcmUser = hcmData?.hcm[0] ?? null;
    const hcmSpouse = hcmData?.hcm[1] ?? null;
    const hasSpouse = hcmSpouse !== null;
    const userStaffGroup = userData?.user.usStaffGroup ?? null;
    const spouseStaffGroup = userData?.user.spouseUsStaffGroup ?? null;
    const hasNonRmoSpouse =
      hcmUser?.staffInfo.userPersonType ===
      UserPersonTypeEnum.EmployeeStaffNonRmoSpouse;
    const loading = hcmLoading || userLoading;

    return {
      hcmUser,
      hcmSpouse,
      hasSpouse,
      userStaffGroup,
      spouseStaffGroup,
      hasNonRmoSpouse,
      scenario: deriveScenario({
        loading,
        hasSpouse,
        userStaffGroup,
        spouseStaffGroup,
        hasNonRmoSpouse,
      }),
      loading,
    };
  }, [hcmData, userData, hcmLoading, userLoading]);
};
