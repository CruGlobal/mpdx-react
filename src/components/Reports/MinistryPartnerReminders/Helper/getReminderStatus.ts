import { PledgeFrequencyEnum } from 'src/graphql/types.generated';
import { ReminderStatusEnum } from '../mockData';

export function getReminderStatus(
  pledgeFrequency: PledgeFrequencyEnum | undefined,
): ReminderStatusEnum {
  if (pledgeFrequency === PledgeFrequencyEnum.Monthly) {
    return ReminderStatusEnum.Monthly;
  } else if (pledgeFrequency === PledgeFrequencyEnum.Every_2Months) {
    return ReminderStatusEnum.BiMonthly;
  } else if (pledgeFrequency === PledgeFrequencyEnum.Quarterly) {
    return ReminderStatusEnum.Quarterly;
  } else if (pledgeFrequency === PledgeFrequencyEnum.Every_6Months) {
    return ReminderStatusEnum.SemiAnnual;
  } else if (pledgeFrequency === PledgeFrequencyEnum.Annual) {
    return ReminderStatusEnum.Annual;
  }
  return ReminderStatusEnum.NotReminded;
}
