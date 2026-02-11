import { MinistryPartnerReminderFrequencyEnum } from 'src/graphql/types.generated';
import { ReminderStatusEnum } from '../mockData';

const enumMap: Record<
  MinistryPartnerReminderFrequencyEnum,
  ReminderStatusEnum
> = {
  [MinistryPartnerReminderFrequencyEnum.NotReminded]:
    ReminderStatusEnum.NotReminded,
  [MinistryPartnerReminderFrequencyEnum.Monthly]: ReminderStatusEnum.Monthly,
  [MinistryPartnerReminderFrequencyEnum.Bimonthly]:
    ReminderStatusEnum.BiMonthly,
  [MinistryPartnerReminderFrequencyEnum.Quarterly]:
    ReminderStatusEnum.Quarterly,
  [MinistryPartnerReminderFrequencyEnum.SemiAnnually]:
    ReminderStatusEnum.SemiAnnual,
  [MinistryPartnerReminderFrequencyEnum.Annually]: ReminderStatusEnum.Annual,
  [MinistryPartnerReminderFrequencyEnum.DoNotRemind]:
    ReminderStatusEnum.DoNotRemind,
};

export function getReminderStatus(
  reminderFrequency: MinistryPartnerReminderFrequencyEnum | undefined,
): ReminderStatusEnum {
  if (!reminderFrequency) {
    return ReminderStatusEnum.NotReminded;
  }

  return enumMap[reminderFrequency];
}
