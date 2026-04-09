import { TFunction } from 'i18next';
import { UserTypeEnum } from 'src/graphql/types.generated';

export const getUserType = (
  userType: UserTypeEnum | undefined,
  t: TFunction,
) => {
  switch (userType) {
    case UserTypeEnum.UsStaff:
      return t('Cru US Staff');
    case UserTypeEnum.GlobalStaff:
      return t('Cru Global Staff');
    case UserTypeEnum.NonCru:
      return t('Non Cru User');
    default:
      return t('Unknown');
  }
};
