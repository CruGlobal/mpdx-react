import Loading from 'src/components/Loading';
import { useGetUserQuery } from 'src/components/User/GetUser.generated';
import { UserTypeEnum } from 'src/graphql/types.generated';
import { useUsStaffGroups } from 'src/hooks/useUsStaffGroups';
import { LimitedAccess } from '../LimitedAccess/LimitedAccess';
import { useStaffAccountQuery } from '../StaffAccount/StaffAccount.generated';

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
  const { data, loading: userLoading, error: userError } = useGetUserQuery();
  const {
    data: staffAccountData,
    loading: staffAccountLoading,
    error: staffAccountError,
  } = useStaffAccountQuery({
    skip: !requireStaffAccount,
  });

  // Only run HCM query if we are using an HCM report
  const skip = !requireUserGroups;
  const {
    inAsrIneligibleGroup,
    inSalaryCalcIneligibleGroup,
    inMhaIneligibleGroup,
    inMpdGoalCalcIneligibleGroup,
    inPdsGoalCalcIneligibleGroup,
    loading: hcmLoading,
  } = useUsStaffGroups(skip);

  const ineligibleByGroup: Record<RequiredUserGroupEnum, boolean> = {
    [RequiredUserGroupEnum.Asr]: inAsrIneligibleGroup,
    [RequiredUserGroupEnum.SalaryCalc]: inSalaryCalcIneligibleGroup,
    [RequiredUserGroupEnum.Mha]: inMhaIneligibleGroup,
    [RequiredUserGroupEnum.MpdGoalCalc]: inMpdGoalCalcIneligibleGroup,
    [RequiredUserGroupEnum.PdsGoalCalc]: inPdsGoalCalcIneligibleGroup,
  };

  const userType = data?.user.userType;

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

  if ((userLoading && !userType) || hcmLoading) {
    return <Loading loading />;
  }

  if (limitedAccess) {
    return <LimitedAccess />;
  }

  if (requireStaffAccount) {
    if (staffAccountError) {
      return <LimitedAccess userGroupError />;
    }
    if (staffAccountLoading && !staffAccountData) {
      return <Loading loading />;
    }
    if (!staffAccountData?.staffAccount?.id) {
      return <LimitedAccess noStaffAccount />;
    }
  }

  return children;
};
