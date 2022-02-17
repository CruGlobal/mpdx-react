import { ActivityTypeEnum } from '../../../../../graphql/types.generated';
import { GetTaskForTaskDrawerQuery } from '../../Drawer/TaskDrawerTask.generated';

export const possibleNextActions = (
  task: GetTaskForTaskDrawerQuery['task'],
): ActivityTypeEnum[] => {
  const common = [
    ActivityTypeEnum.None,
    ActivityTypeEnum.Call,
    ActivityTypeEnum.Email,
    ActivityTypeEnum.TextMessage,
    ActivityTypeEnum.FacebookMessage,
    ActivityTypeEnum.TalkToInPerson,
  ];
  switch (task.activityType) {
    case ActivityTypeEnum.Call:
    case ActivityTypeEnum.Email:
    case ActivityTypeEnum.TextMessage:
    case ActivityTypeEnum.FacebookMessage:
    case ActivityTypeEnum.TalkToInPerson:
    case ActivityTypeEnum.PrayerRequest:
      return [
        ...common,
        ActivityTypeEnum.Appointment,
        ActivityTypeEnum.PrayerRequest,
        ActivityTypeEnum.Thank,
      ];
    case ActivityTypeEnum.Appointment:
      return [
        ...common,
        ActivityTypeEnum.PrayerRequest,
        ActivityTypeEnum.Thank,
      ];
    case ActivityTypeEnum.Letter:
    case ActivityTypeEnum.PreCallLetter:
    case ActivityTypeEnum.ReminderLetter:
    case ActivityTypeEnum.SupportLetter:
    case ActivityTypeEnum.Thank:
      return common;
    default:
      return [];
  }
};
