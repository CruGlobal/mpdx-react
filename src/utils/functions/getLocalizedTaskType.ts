import { TFunction } from 'react-i18next';
import { ActivityTypeEnum } from 'src/graphql/types.generated';

export const getLocalizedTaskTitle = (
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
      return t('Phone Appointment');
    case ActivityTypeEnum.AppointmentVideoCall:
      return t('Video Appointment');

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
      return t('Email To Initiate Appointment');
    case ActivityTypeEnum.InitiationTextMessage:
      return t('Text To Initiate Appointment');
    case ActivityTypeEnum.InitiationSocialMedia:
      return t('Social Media Message To Initiate Appointment');
    case ActivityTypeEnum.InitiationLetter:
      return t('Letter To Initiate Appointment');
    case ActivityTypeEnum.InitiationSpecialGiftAppeal:
      return t('Special Gift Appeal');
    case ActivityTypeEnum.InitiationInPerson:
      return t('Initiate in Person for an Appointment');

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
