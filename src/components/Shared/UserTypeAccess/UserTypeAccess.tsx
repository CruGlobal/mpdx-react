import Loading from 'src/components/Loading';
import { useStaffAccountQuery } from 'src/components/Reports/StaffAccount.generated';
import { useGetUserQuery } from 'src/components/User/GetUser.generated';
import { UserTypeEnum } from 'src/graphql/types.generated';
import { LimitedAccess } from '../LimitedAccess/LimitedAccess';

interface UserTypeAccessProps {
  allowedUserType?: UserTypeEnum;
  requireStaffAccount?: boolean;
  children: React.ReactElement;
}

export const UserTypeAccess: React.FC<UserTypeAccessProps> = ({
  allowedUserType = UserTypeEnum.UsStaff,
  requireStaffAccount,
  children,
}) => {
  const { data, loading: userLoading, error } = useGetUserQuery();
  const { data: staffAccountData, loading } = useStaffAccountQuery({
    skip: !requireStaffAccount,
  });

  const userType = data?.user.userType;

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
    if (loading && !staffAccountData) {
      return <Loading loading />;
    }
    if (!staffAccountData?.staffAccount?.id) {
      return <LimitedAccess noStaffAccount />;
    }
  }

  return children;
};
