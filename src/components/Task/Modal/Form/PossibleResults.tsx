import {
  ActivityTypeEnum,
  ResultEnum,
} from '../../../../../graphql/types.generated';

export const possibleResults = (
  activityType: ActivityTypeEnum,
): ResultEnum[] => {
  const common = [ResultEnum.None, ResultEnum.Completed];
  switch (activityType) {
    case ActivityTypeEnum.Call:
      return [
        ...common,
        ResultEnum.Attempted,
        ResultEnum.AttemptedLeftMessage,
        ResultEnum.Received,
      ];
    case ActivityTypeEnum.Appointment:
      return [...common, ResultEnum.Attempted];
    case ActivityTypeEnum.Email:
    case ActivityTypeEnum.TextMessage:
    case ActivityTypeEnum.FacebookMessage:
    case ActivityTypeEnum.TalkToInPerson:
    case ActivityTypeEnum.Letter:
    case ActivityTypeEnum.PreCallLetter:
    case ActivityTypeEnum.ReminderLetter:
    case ActivityTypeEnum.SupportLetter:
    case ActivityTypeEnum.Thank:
      return [...common, ResultEnum.Received];
    case ActivityTypeEnum.PrayerRequest:
      return common;
    default:
      return [];
  }
};
