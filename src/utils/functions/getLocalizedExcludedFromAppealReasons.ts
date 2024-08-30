import { TFunction } from 'react-i18next';
import { ExcludedAppealContactReasonEnum } from 'src/graphql/types.generated';

export const getLocalizedExcludedFromAppealReasons = (
  t: TFunction,
  excludedReason: ExcludedAppealContactReasonEnum | null | undefined,
): string => {
  switch (excludedReason) {
    case ExcludedAppealContactReasonEnum.GaveMoreThanPledgedRange:
      return t('May have given a special gift in the last 3 months');
    case ExcludedAppealContactReasonEnum.IncreasedRecently:
      return t('Increased Recently');
    case ExcludedAppealContactReasonEnum.JoinedRecently:
      return t('Joined Recently');
    case ExcludedAppealContactReasonEnum.MarkedDoNotAsk:
      return t('Marked Do Not Ask');
    case ExcludedAppealContactReasonEnum.NoAppeals:
      return t('Send Appeals?" set to No');
    case ExcludedAppealContactReasonEnum.PledgeAmountIncreasedRange:
      return t('May have increased their giving in the last 3 months');
    case ExcludedAppealContactReasonEnum.PledgeLateBy:
      return t('May have missed a gift in the last 30-90 days');
    case ExcludedAppealContactReasonEnum.SpecialGift:
      return t('Special Gift');
    case ExcludedAppealContactReasonEnum.StartedGivingRange:
      return t('May have joined my team in the last 3 months');
    case ExcludedAppealContactReasonEnum.StoppedGiving:
      return t('Stopped Giving');
    case ExcludedAppealContactReasonEnum.StoppedGivingRange:
      return t('Stopped Giving Range');
    default:
      return '';
  }
};
