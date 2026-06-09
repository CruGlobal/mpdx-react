import Loading from 'src/components/Loading';
import { UserTypeEnum } from 'src/graphql/types.generated';
import { useIneligibleByGroup } from 'src/hooks/useIneligibleByGroup';
import { useRequiredSession } from 'src/hooks/useRequiredSession';
import { LimitedAccess } from '../LimitedAccess/LimitedAccess';

export enum RequiredUserGroupEnum {
  Asr = 'asr',
  SalaryCalc = 'salaryCalc',
  Mha = 'mha',
  MpdGoalCalc = 'mpdGoalCalc',
  NsGoalCalc = 'nsGoalCalc',
  PdsGoalCalc = 'pdsGoalCalc',
}

interface UserTypeAccessProps {
  requiredUserType?: UserTypeEnum;
  requireStaffAccount?: boolean;
  requireUserGroups?: RequiredUserGroupEnum;
  children: React.ReactElement;
  alwaysAllow?: boolean;
}

export const UserTypeAccess: React.FC<UserTypeAccessProps> = ({
  requiredUserType = UserTypeEnum.UsStaff,
  requireStaffAccount,
  children,
  alwaysAllow,
  requireUserGroups,
}) => {
  const {
    inAsrIneligibleGroup,
    inSalaryCalcIneligibleGroup,
    inMhaIneligibleGroup,
    inMpdGoalCalcIneligibleGroup,
    inNsGoalCalcIneligibleGroup,
    inPdsGoalCalcIneligibleGroup,
    userType,
    hasNoStaffAccount,
    userLoading,
    userError,
  } = useIneligibleByGroup();
  const { developer } = useRequiredSession();

  const ineligibleByGroup: Record<RequiredUserGroupEnum, boolean> = {
    [RequiredUserGroupEnum.Asr]: inAsrIneligibleGroup,
    [RequiredUserGroupEnum.SalaryCalc]: inSalaryCalcIneligibleGroup,
    [RequiredUserGroupEnum.Mha]: inMhaIneligibleGroup,
    [RequiredUserGroupEnum.MpdGoalCalc]: inMpdGoalCalcIneligibleGroup,
    [RequiredUserGroupEnum.NsGoalCalc]: inNsGoalCalcIneligibleGroup,
    [RequiredUserGroupEnum.PdsGoalCalc]: inPdsGoalCalcIneligibleGroup,
  };

  const limitedAccess =
    (userType && userType !== requiredUserType) ||
    (requireUserGroups && ineligibleByGroup[requireUserGroups]);

  // When not in production, developers bypass all eligibility gating so they can reach all pages
  // Once HCM is ready to go live and DISABLE_NEW_REPORTS is removed, we can remove the alwaysAllow prop
  if (alwaysAllow || (process.env.DEVELOPMENT_ENV === 'true' && developer)) {
    return children;
  }

  if (userError) {
    return <LimitedAccess userGroupError />;
  }

  if (userLoading && !userType) {
    return <Loading loading />;
  }

  if (limitedAccess) {
    return <LimitedAccess />;
  }

  if (requireStaffAccount && hasNoStaffAccount) {
    return <LimitedAccess noStaffAccount />;
  }

  return children;
};
