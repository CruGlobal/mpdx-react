import { TFunction } from 'react-i18next';
import { ResultEnum } from 'src/graphql/types.generated';
import { NewResultEnum } from 'src/hooks/useContactPhaseDataMockData';

export const getLocalizedResultString = (
  t: TFunction,
  resultType: ResultEnum | NewResultEnum | null | undefined,
): string => {
  if (!resultType) {
    return '';
  }

  switch (resultType) {
    case ResultEnum.Attempted:
      return t('Attempted');

    case ResultEnum.AttemptedLeftMessage:
      return t('Attempted - Left Message');

    case ResultEnum.Completed:
      return t('Completed');

    // The Done and None branches should never be hit but are left for completeness
    /* istanbul ignore next */
    case ResultEnum.Done:
      return t('Done');

    /* istanbul ignore next */
    case ResultEnum.None:
      return t('None');

    case ResultEnum.Received:
      return t('Received');

    // TODO remove when new ResultEnum is added
    case NewResultEnum.NoResponseYet:
      return t('No Response Yet');

    case NewResultEnum.DoesNotWantToMeet:
      return t('Does not want to meet');

    case NewResultEnum.CantMeetRightNowCircleBack:
      return t("Can't meet right now - circle back");

    case NewResultEnum.AppointmentScheduled:
      return t('Appointment Scheduled');

    case NewResultEnum.CancelledNeedToReschedule:
      return t('Cancelled-Need to reschedule');

    case NewResultEnum.FollowUp:
      return t('FollowUp');

    case NewResultEnum.PartnerFinancial:
      return t('Partner-Financial');

    case NewResultEnum.PartnerSpecial:
      return t('Partner-Special');

    case NewResultEnum.PartnerPray:
      return t('Partner-Pray');

    case NewResultEnum.NotInterested:
      return t('Not Interested');
  }
};
