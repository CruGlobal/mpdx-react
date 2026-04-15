import Loading from 'src/components/Loading';
import { useStaffAccountQuery } from 'src/components/Reports/StaffAccount.generated';
import { useGetUserQuery } from 'src/components/User/GetUser.generated';
import { UserTypeEnum } from 'src/graphql/types.generated';
import { useUsStaffGroups } from 'src/hooks/useUsStaffGroups';
import { LimitedAccess } from '../LimitedAccess/LimitedAccess';

interface UserTypeAccessProps {
  allowedUserType?: UserTypeEnum;
  requireStaffAccount?: boolean;
  isAsr?: boolean;
  isSalaryCalc?: boolean;
  effectiveDate?: string | null;
  children: React.ReactElement;
  alwaysAllow?: boolean;
}

export const UserTypeAccess: React.FC<UserTypeAccessProps> = ({
  allowedUserType = UserTypeEnum.UsStaff,
  requireStaffAccount,
  isAsr,
  isSalaryCalc,
  effectiveDate,
  children,
  alwaysAllow,
}) => {
  const { data, loading: userLoading, error } = useGetUserQuery();
  const {
    data: staffAccountData,
    loading,
    error: staffAccountError,
  } = useStaffAccountQuery({
    skip: !requireStaffAccount,
  });
  const { inAsrIneligibleGroup, inSalaryCalcIneligibleGroup } =
    useUsStaffGroups(isSalaryCalc ? (effectiveDate ?? undefined) : undefined);
  const userType = data?.user.userType;
  const cruUsStaff = userType === UserTypeEnum.UsStaff;

  const limitedAccess =
    (userType && userType !== allowedUserType) ||
    (isAsr && cruUsStaff && inAsrIneligibleGroup) ||
    (isSalaryCalc && cruUsStaff && inSalaryCalcIneligibleGroup);

  // Once HCM is ready to go live and DISABLE_NEW_REPORTS is removed, we can remove the alwaysAllow prop
  if (alwaysAllow) {
    return children;
  }

  if (error) {
    return <LimitedAccess userGroupError />;
  }

  if (userLoading && !userType) {
    return <Loading loading />;
  }

  if (limitedAccess) {
    return <LimitedAccess />;
  }

  if (requireStaffAccount) {
    if (staffAccountError) {
      return <LimitedAccess userGroupError />;
    }
    if (loading && !staffAccountData) {
      return <Loading loading />;
    }
    if (!staffAccountData?.staffAccount?.id) {
      return <LimitedAccess noStaffAccount />;
    }
  }

  return children;
};
