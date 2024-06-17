import { TFunction } from 'react-i18next';
import { ActivityTypeEnum } from 'src/graphql/types.generated';

export const getLocalizedTaskType = (
  t: TFunction,
  taskType: ActivityTypeEnum | null | undefined,
): string => {
  if (!taskType) {
    return '';
  }

  switch (taskType) {
    case ActivityTypeEnum.None:
      return t('None');

    case ActivityTypeEnum.InitiationInPerson:
    case ActivityTypeEnum.FollowUpInPerson:
    case ActivityTypeEnum.AppointmentInPerson:
    case ActivityTypeEnum.PartnerCareInPerson:
      return t('In Person');

    case ActivityTypeEnum.AppointmentPhoneCall:
    case ActivityTypeEnum.InitiationPhoneCall:
    case ActivityTypeEnum.FollowUpPhoneCall:
    case ActivityTypeEnum.PartnerCarePhoneCall:
      return t('Phone Call');

    case ActivityTypeEnum.AppointmentVideoCall:
      return t('Video Call');

    case ActivityTypeEnum.InitiationEmail:
    case ActivityTypeEnum.FollowUpEmail:
    case ActivityTypeEnum.PartnerCareEmail:
      return t('Email');

    case ActivityTypeEnum.InitiationTextMessage:
    case ActivityTypeEnum.FollowUpTextMessage:
    case ActivityTypeEnum.PartnerCareTextMessage:
      return t('Text Message');

    case ActivityTypeEnum.FollowUpSocialMedia:
    case ActivityTypeEnum.PartnerCareSocialMedia:
    case ActivityTypeEnum.InitiationSocialMedia:
      return t('Social Media');

    case ActivityTypeEnum.InitiationLetter:
      return t('Letter');
    case ActivityTypeEnum.InitiationSpecialGiftAppeal:
      return t('Special Gift Appeal');

    case ActivityTypeEnum.PartnerCarePhysicalNewsletter:
      return t('Physical Newsletter');
    case ActivityTypeEnum.PartnerCareDigitalNewsletter:
      return t('Digital Newsletter');
    case ActivityTypeEnum.PartnerCareThank:
      return t('Thank You Note');
    case ActivityTypeEnum.PartnerCarePrayerRequest:
      return t('Prayer Request');
    case ActivityTypeEnum.PartnerCareUpdateInformation:
      return t('Update Information');
    case ActivityTypeEnum.PartnerCareToDo:
      return t('To Do');
  }
};
