import { MinistryPartnerReminderFrequencyEnum } from 'src/graphql/types.generated';
import { ReminderStatusEnum } from '../mockData';

export function getReminderStatus(
  reminderFrequency: MinistryPartnerReminderFrequencyEnum | undefined,
): ReminderStatusEnum {
  if (reminderFrequency === MinistryPartnerReminderFrequencyEnum.Monthly) {
    return ReminderStatusEnum.Monthly;
  } else if (
    reminderFrequency === MinistryPartnerReminderFrequencyEnum.Bimonthly
  ) {
    return ReminderStatusEnum.BiMonthly;
  } else if (
    reminderFrequency === MinistryPartnerReminderFrequencyEnum.Quarterly
  ) {
    return ReminderStatusEnum.Quarterly;
  } else if (
    reminderFrequency === MinistryPartnerReminderFrequencyEnum.SemiAnnually
  ) {
    return ReminderStatusEnum.SemiAnnual;
  } else if (
    reminderFrequency === MinistryPartnerReminderFrequencyEnum.Annually
  ) {
    return ReminderStatusEnum.Annual;
  } else if (
    reminderFrequency === MinistryPartnerReminderFrequencyEnum.DoNotRemind
  ) {
    return ReminderStatusEnum.DoNotRemind;
  }
  return ReminderStatusEnum.NotReminded;
}
