import { TFunction } from 'i18next';
import { UserTypeEnum } from 'src/graphql/types.generated';

export const getUserType = (
  userType: UserTypeEnum | undefined,
  t: TFunction,
) => {
  switch (userType) {
    case UserTypeEnum.UsStaff:
      return {
        label: t('Cru US Staff'),
        sublabel: t(
          'Users in this group receive (mostly) US donations and are paid through our US HR system.',
        ),
      };
    case UserTypeEnum.GlobalStaff:
      return {
        label: t('Cru Global Staff'),
        sublabel: t(
          'Users in this group receive (mostly) non-US donations and are paid through our Global NetSuite system.',
        ),
      };
    case UserTypeEnum.NonCru:
      return {
        label: t("We see you're not on staff with Cru."),
        sublabel: null,
      };
    case UserTypeEnum.HybridStaff:
      return {
        label: t('Cru Hybrid Staff'),
        sublabel: t(
          'Users in this group receive donations through our Global NetSuite system but also need access to US HR forms (Salary Calc, MHA Calc, etc).',
        ),
      };
    default:
      return {
        label: t('Unknown'),
        sublabel: null,
      };
  }
};
