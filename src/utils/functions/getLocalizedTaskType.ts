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

    case ActivityTypeEnum.AppointmentInPerson:
      return t('In Person Appointment');
    case ActivityTypeEnum.AppointmentPhoneCall:
      return t('In Person Appointment');
    case ActivityTypeEnum.AppointmentVideoCall:
      return t('Phone Appointment');

    case ActivityTypeEnum.FollowUpEmail:
      return t('Email To Follow Up');
    case ActivityTypeEnum.FollowUpPhoneCall:
      return t('Call To Follow Up');
    case ActivityTypeEnum.FollowUpTextMessage:
      return t('Text To Follow Up');
    case ActivityTypeEnum.FollowUpSocialMedia:
      return t('Social Media Message To Follow Up');
    case ActivityTypeEnum.FollowUpInPerson:
      return t('In Person Follow Up');

    case ActivityTypeEnum.InitiationPhoneCall:
      return t('Phone Call To Initiate Appointment');
    case ActivityTypeEnum.InitiationEmail:
      return t('Email To Initiate');
    case ActivityTypeEnum.InitiationTextMessage:
      return t('Text To Initiate');
    case ActivityTypeEnum.InitiationSocialMedia:
      return t('Social Media Message To Initiate');
    case ActivityTypeEnum.InitiationLetter:
      return t('Letter To Initiate');
    case ActivityTypeEnum.InitiationSpecialGiftAppeal:
      return t('Special Gift Appeal');
    case ActivityTypeEnum.InitiationInPerson:
      return t('Initiate in Person');

    case ActivityTypeEnum.PartnerCarePhysicalNewsletter:
      return t('Send Physical Newsletter');
    case ActivityTypeEnum.PartnerCareDigitalNewsletter:
      return t('Send Digital Newsletter');
    case ActivityTypeEnum.PartnerCareThank:
      return t('Send Thank You Note');
    case ActivityTypeEnum.PartnerCarePrayerRequest:
      return t('Ask For Or Receive Prayer Request');
    case ActivityTypeEnum.PartnerCareUpdateInformation:
      return t('Update Partner Information');
    case ActivityTypeEnum.PartnerCarePhoneCall:
      return t('Call Partner For Cultivation');
    case ActivityTypeEnum.PartnerCareEmail:
      return t('Email Partner For Cultivation');
    case ActivityTypeEnum.PartnerCareTextMessage:
      return t('Text Message Partner For Cultivation');
    case ActivityTypeEnum.PartnerCareSocialMedia:
      return t('Social Media Message For Cultivation');
    case ActivityTypeEnum.PartnerCareInPerson:
      return t('Connect In Person For Cultivation');
    case ActivityTypeEnum.PartnerCareToDo:
      return t('To Do');
  }
};
