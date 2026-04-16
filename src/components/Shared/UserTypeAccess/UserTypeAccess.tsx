import Loading from 'src/components/Loading';
import { useStaffAccountQuery } from 'src/components/Reports/StaffAccount.generated';
import { useGetUserQuery } from 'src/components/User/GetUser.generated';
import { UserTypeEnum } from 'src/graphql/types.generated';
import { LimitedAccess } from '../LimitedAccess/LimitedAccess';

interface UserTypeAccessProps {
  allowedUserType?: UserTypeEnum;
  requireStaffAccount?: boolean;
  children: React.ReactElement;
  alwaysAllow?: boolean;
}

export const UserTypeAccess: React.FC<UserTypeAccessProps> = ({
  allowedUserType = UserTypeEnum.UsStaff,
  requireStaffAccount,
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

  const userType = data?.user.userType;

  // Once HCM is ready to go live and DISABLE_NEW_REPORTS is removed, we can remove the alwaysAllow prop
  if (alwaysAllow) {
    return children;
  }

  if (error) {
    return <LimitedAccess userGroupError />;
  }

  if (userLoading && !userType) {
    return null;
  }

  if (userType && userType !== allowedUserType) {
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
