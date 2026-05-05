import { TFunction } from 'react-i18next';
import { MinistryPartnerReminderFrequencyEnum } from 'src/graphql/types.generated';

export const getLocalizedReminderStatus = (
  t: TFunction,
  status: MinistryPartnerReminderFrequencyEnum | undefined,
): string => {
  switch (status) {
    case MinistryPartnerReminderFrequencyEnum.Monthly:
      return t('Monthly');
    case MinistryPartnerReminderFrequencyEnum.Bimonthly:
      return t('Bi-Monthly');
    case MinistryPartnerReminderFrequencyEnum.Quarterly:
      return t('Quarterly');
    case MinistryPartnerReminderFrequencyEnum.SemiAnnually:
      return t('Semi-Annually');
    case MinistryPartnerReminderFrequencyEnum.Annually:
      return t('Annually');
    case MinistryPartnerReminderFrequencyEnum.DoNotRemind:
      return t('Do Not Remind');
    case MinistryPartnerReminderFrequencyEnum.NotReminded:
    default:
      return t('Not Reminded');
  }
};
