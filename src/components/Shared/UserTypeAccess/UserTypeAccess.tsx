import Loading from 'src/components/Loading';
import { UserTypeEnum } from 'src/graphql/types.generated';
import { useDeveloperBypass } from 'src/hooks/useDeveloperBypass';
import { useIneligibleByGroup } from 'src/hooks/useIneligibleByGroup';
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
  const developerBypass = useDeveloperBypass();

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

  // Once HCM is ready to go live and DISABLE_NEW_REPORTS is removed, we can remove the alwaysAllow prop
  if (alwaysAllow || developerBypass) {
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
