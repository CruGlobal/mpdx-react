import Loading from 'src/components/Loading';
import { UserTypeEnum } from 'src/graphql/types.generated';
import { useIneligibleByGroup } from 'src/hooks/useIneligibleByGroup';
import { LimitedAccess } from '../LimitedAccess/LimitedAccess';

export enum RequiredUserGroupEnum {
  Asr = 'asr',
  SalaryCalc = 'salaryCalc',
  Mha = 'mha',
  MpdGoalCalc = 'mpdGoalCalc',
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
    inPdsGoalCalcIneligibleGroup,
    userType,
    hasNoStaffAccount,
    userLoading,
    userError,
  } = useIneligibleByGroup();

  const ineligibleByGroup: Record<RequiredUserGroupEnum, boolean> = {
    [RequiredUserGroupEnum.Asr]: inAsrIneligibleGroup,
    [RequiredUserGroupEnum.SalaryCalc]: inSalaryCalcIneligibleGroup,
    [RequiredUserGroupEnum.Mha]: inMhaIneligibleGroup,
    [RequiredUserGroupEnum.MpdGoalCalc]: inMpdGoalCalcIneligibleGroup,
    [RequiredUserGroupEnum.PdsGoalCalc]: inPdsGoalCalcIneligibleGroup,
  };

  const limitedAccess =
    (userType && userType !== requiredUserType) ||
    (requireUserGroups && ineligibleByGroup[requireUserGroups]);

  // Once HCM is ready to go live and DISABLE_NEW_REPORTS is removed, we can remove the alwaysAllow prop
  if (alwaysAllow) {
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

  if (requireStaffAccount) {
    if (hasNoStaffAccount) {
      return <LimitedAccess noStaffAccount />;
    }
  }

  return children;
};
