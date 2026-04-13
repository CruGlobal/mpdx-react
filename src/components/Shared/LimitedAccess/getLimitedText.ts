import { TFunction } from 'i18next';

interface GetLimitedTextProps {
  t: TFunction;
  noStaffAccount?: boolean;
  userGroupError?: boolean;
}

export const getLimitedText = ({
  t,
  noStaffAccount,
  userGroupError,
}: GetLimitedTextProps) => {
  if (userGroupError) {
    return {
      title: t('Unable to load this page'),
      content: t(
        'Something went wrong while loading your account information. Please try again later. If the problem persists, please contact ',
      ),
      ending: '.',
    };
  }

  if (noStaffAccount) {
    return {
      title: t('Access to this feature is limited.'),
      content: t(
        'Our records show that you do not have a staff account. You cannot access this feature if you do not have a staff account. If you think this is a mistake, please contact ',
      ),
      ending: '.',
    };
  }

  return {
    title: t('Access to this feature is limited.'),
    content: t(
      'Our records show that you are not part of the user group that has access to this feature. If you think this is a mistake, please contact ',
    ),
    ending: t(' to change your user group.'),
  };
};
