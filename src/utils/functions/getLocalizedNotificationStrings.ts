import { TFunction } from 'react-i18next';
import {
  NotificationTypeEnum,
  NotificationTimeUnitEnum,
} from '../../../graphql/types.generated';

export const getLocalizedNotificationType = (
  t: TFunction,
  notificationType: NotificationTypeEnum | null | undefined,
): string => {
  if (!notificationType) {
    return '';
  }

  switch (notificationType) {
    case NotificationTypeEnum.Both:
      return t('Both');

    case NotificationTypeEnum.Email:
      return t('Email');

    case NotificationTypeEnum.Mobile:
      return t('Mobile');
  }
};

export const getLocalizedNotificationTimeUnit = (
  t: TFunction,
  notificationTimeUnit: NotificationTimeUnitEnum | null | undefined,
): string => {
  if (!notificationTimeUnit) {
    return '';
  }

  switch (notificationTimeUnit) {
    case NotificationTimeUnitEnum.Days:
      return t('Days');

    case NotificationTimeUnitEnum.Hours:
      return t('Hours');

    case NotificationTimeUnitEnum.Minutes:
      return t('Minutes');
  }
};
