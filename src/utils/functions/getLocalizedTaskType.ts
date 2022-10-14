import { TFunction } from 'react-i18next';
import { ActivityTypeEnum } from '../../../graphql/types.generated';

export const getLocalizedTaskType = (
  t: TFunction,
  taskType: ActivityTypeEnum | null | undefined,
): string => {
  if (!taskType) {
    return '';
  }

  switch (taskType) {
    case ActivityTypeEnum.Appointment:
      return t('Appointment');

    case ActivityTypeEnum.Call:
      return t('Call');

    case ActivityTypeEnum.Email:
      return t('Email');

    case ActivityTypeEnum.FacebookMessage:
      return t('Facebook Message');

    case ActivityTypeEnum.Letter:
      return t('Letter');

    case ActivityTypeEnum.NewsletterEmail:
      return t('Newsletter - Email');

    case ActivityTypeEnum.NewsletterPhysical:
      return t('Newsletter - Physical');

    case ActivityTypeEnum.None:
      return '';

    case ActivityTypeEnum.PrayerRequest:
      return t('Prayer Request');

    case ActivityTypeEnum.PreCallLetter:
      return t('Pre-Call Letter');

    case ActivityTypeEnum.ReminderLetter:
      return t('Reminder Letter');

    case ActivityTypeEnum.SupportLetter:
      return t('Support Letter');

    case ActivityTypeEnum.TalkToInPerson:
      return t('Talk To In Person');

    case ActivityTypeEnum.TextMessage:
      return t('Text Message');

    case ActivityTypeEnum.Thank:
      return t('Thank');

    case ActivityTypeEnum.ToDo:
      return t('To Do');
  }
};
