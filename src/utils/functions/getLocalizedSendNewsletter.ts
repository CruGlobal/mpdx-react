import { TFunction } from 'react-i18next';
import { SendNewsletterEnum } from 'src/graphql/types.generated';

export const getLocalizedSendNewsletter = (
  t: TFunction,
  sendNewsletter: SendNewsletterEnum | null | undefined,
): string => {
  switch (sendNewsletter) {
    case SendNewsletterEnum.Both:
      return t('Both');

    case SendNewsletterEnum.Email:
      return t('Digital');

    case SendNewsletterEnum.None:
      return t('None');

    case SendNewsletterEnum.Physical:
      return t('Physical');

    default:
      return '';
  }
};
