import Loading from 'src/components/Loading';
import { useStaffAccountQuery } from 'src/components/Reports/StaffAccount.generated';
import { useUserPreferenceContext } from 'src/components/User/Preferences/UserPreferenceProvider';
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
  const { data: staffAccountData, loading } = useStaffAccountQuery({
    skip: !requireStaffAccount,
  });
  const { userType, loading: userLoading } = useUserPreferenceContext();

  if (userLoading) {
    return <Loading loading />;
  }

  if (userType !== allowedUserType) {
    return <LimitedAccess />;
  }

  if (requireStaffAccount) {
    if (loading) {
      return <Loading loading />;
    }
    if (!staffAccountData?.staffAccount?.id) {
      return <LimitedAccess noStaffAccount />;
    }
  }

  return children;
};
