import { UserTypeEnum } from 'src/graphql/types.generated';

export const getUserType = (userType: UserTypeEnum | undefined) => {
  switch (userType) {
    case UserTypeEnum.UsStaff:
      return 'Cru US Staff';
    case UserTypeEnum.GlobalStaff:
      return 'Cru Global Staff';
    case UserTypeEnum.NonCru:
      return 'Non Cru User';
    default:
      return 'Unknown';
  }
};
