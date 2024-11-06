import { TFunction } from 'react-i18next';
import { DisplayResultEnum, ResultEnum } from 'src/graphql/types.generated';

export const getLocalizedResultString = (
  t: TFunction,
  resultType: ResultEnum | DisplayResultEnum | null | undefined,
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
    case DisplayResultEnum.PartnerCareCompleted:
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

    case DisplayResultEnum.FollowUpResultNoResponse:
    case DisplayResultEnum.InitiationResultNoResponse:
      return t('No Response Yet');

    case DisplayResultEnum.AppointmentResultNotInterested:
      return t('Not Interested');

    case DisplayResultEnum.InitiationResultCircleBack:
      return t("Can't meet right now - circle back");

    case DisplayResultEnum.InitiationResultAppointmentScheduled:
      return t('Appointment Scheduled');

    case DisplayResultEnum.AppointmentResultCancelled:
      return t('Cancelled-Need to reschedule');

    case DisplayResultEnum.AppointmentResultFollowUp:
      return t('Follow up');

    case DisplayResultEnum.FollowUpResultPartnerFinancial:
    case DisplayResultEnum.AppointmentResultPartnerFinancial:
      return t('Partner-Financial');

    case DisplayResultEnum.FollowUpResultPartnerSpecial:
    case DisplayResultEnum.AppointmentResultPartnerSpecial:
      return t('Partner-Special');

    case DisplayResultEnum.FollowUpResultPartnerPray:
    case DisplayResultEnum.AppointmentResultPartnerPray:
      return t('Partner-Pray');

    case DisplayResultEnum.FollowUpResultNotInterested:
    case DisplayResultEnum.InitiationResultNotInterested:
      return t('Not Interested');

    default:
      return '';
  }
};
