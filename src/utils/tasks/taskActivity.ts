import { useTranslation } from 'react-i18next';
import { ActivityTypeEnum } from '../../../graphql/types.generated';

//  This is a work around to match the Activity Types with Constant Activity Id
export const constantIdFromActivityType = (
  activity: ActivityTypeEnum | undefined,
): string => {
  switch (activity) {
    case ActivityTypeEnum.Call:
      return 'Call';
    case ActivityTypeEnum.Appointment:
      return 'Appointment';
    case ActivityTypeEnum.Email:
      return 'Email';
    case ActivityTypeEnum.TextMessage:
      return 'Text Message';
    case ActivityTypeEnum.FacebookMessage:
      return 'Facebook Message';
    case ActivityTypeEnum.Letter:
      return 'Letter';
    case ActivityTypeEnum.NewsletterPhysical:
      return 'Newsletter - Physical';
    case ActivityTypeEnum.NewsletterEmail:
      return 'Newsletter - Email';
    case ActivityTypeEnum.PreCallLetter:
      return 'Pre Call Letter';
    case ActivityTypeEnum.ReminderLetter:
      return 'Reminder Letter';
    case ActivityTypeEnum.SupportLetter:
      return 'Support Letter';
    case ActivityTypeEnum.Thank:
      return 'Thank';
    case ActivityTypeEnum.ToDo:
      return 'To Do';
    case ActivityTypeEnum.TalkToInPerson:
      return 'Talk to In Person';
    case ActivityTypeEnum.PrayerRequest:
      return 'Prayer Request';
    default:
      return '';
  }
};

export const currentString = (): string => {
  const { t } = useTranslation();
  return t('Current');
};

export const historicString = (): string => {
  const { t } = useTranslation();
  return t('Historic');
};
