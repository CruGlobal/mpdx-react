import { ActivityTypeEnum } from 'src/graphql/types.generated';

export const callActivityTypes = [
  ActivityTypeEnum.AppointmentPhoneCall,
  ActivityTypeEnum.AppointmentVideoCall,
  ActivityTypeEnum.FollowUpPhoneCall,
  ActivityTypeEnum.InitiationPhoneCall,
  ActivityTypeEnum.PartnerCarePhoneCall,
];

export const letterActivityTypes = [
  ActivityTypeEnum.InitiationLetter,
  ActivityTypeEnum.PartnerCareDigitalNewsletter,
  ActivityTypeEnum.PartnerCarePhysicalNewsletter,
];

export const emailActivityTypes = [
  ActivityTypeEnum.FollowUpEmail,
  ActivityTypeEnum.InitiationEmail,
  ActivityTypeEnum.PartnerCareEmail,
];

export const socialMediaActivityTypes = [
  ActivityTypeEnum.FollowUpSocialMedia,
  ActivityTypeEnum.InitiationSocialMedia,
  ActivityTypeEnum.PartnerCareSocialMedia,
];

export const textActivityTypes = [
  ActivityTypeEnum.FollowUpTextMessage,
  ActivityTypeEnum.InitiationTextMessage,
  ActivityTypeEnum.PartnerCareTextMessage,
];

export const inPersonActivityTypes = [
  ActivityTypeEnum.AppointmentInPerson,
  ActivityTypeEnum.FollowUpInPerson,
  ActivityTypeEnum.InitiationInPerson,
  ActivityTypeEnum.PartnerCareInPerson,
];

export const electronicActivityTypes = [
  ActivityTypeEnum.AppointmentVideoCall,
  ActivityTypeEnum.FollowUpEmail,
  ActivityTypeEnum.FollowUpSocialMedia,
  ActivityTypeEnum.FollowUpTextMessage,
  ActivityTypeEnum.InitiationEmail,
  ActivityTypeEnum.InitiationSocialMedia,
  ActivityTypeEnum.InitiationTextMessage,
  ActivityTypeEnum.PartnerCareEmail,
  ActivityTypeEnum.PartnerCareSocialMedia,
  ActivityTypeEnum.PartnerCareTextMessage,
];

// Phase types

export const appointmentActivityTypes = [
  ActivityTypeEnum.AppointmentInPerson,
  ActivityTypeEnum.AppointmentVideoCall,
  ActivityTypeEnum.AppointmentPhoneCall,
];

// export enum ActivityTypeEnum {
//   AppointmentInPerson = 'APPOINTMENT_IN_PERSON',
//   AppointmentPhoneCall = 'APPOINTMENT_PHONE_CALL',
//   AppointmentVideoCall = 'APPOINTMENT_VIDEO_CALL',
//   FollowUpEmail = 'FOLLOW_UP_EMAIL',
//   FollowUpInPerson = 'FOLLOW_UP_IN_PERSON',
//   FollowUpPhoneCall = 'FOLLOW_UP_PHONE_CALL',
//   FollowUpSocialMedia = 'FOLLOW_UP_SOCIAL_MEDIA',
//   FollowUpTextMessage = 'FOLLOW_UP_TEXT_MESSAGE',
//   InitiationEmail = 'INITIATION_EMAIL',
//   InitiationInPerson = 'INITIATION_IN_PERSON',
//   InitiationLetter = 'INITIATION_LETTER',
//   InitiationPhoneCall = 'INITIATION_PHONE_CALL',
//   InitiationSocialMedia = 'INITIATION_SOCIAL_MEDIA',
//   InitiationSpecialGiftAppeal = 'INITIATION_SPECIAL_GIFT_APPEAL',
//   InitiationTextMessage = 'INITIATION_TEXT_MESSAGE',
//   /** special type when filtered by will return any task with no activityType */
//   None = 'NONE',
//   PartnerCareDigitalNewsletter = 'PARTNER_CARE_DIGITAL_NEWSLETTER',
//   PartnerCareEmail = 'PARTNER_CARE_EMAIL',
//   PartnerCareInPerson = 'PARTNER_CARE_IN_PERSON',
//   PartnerCarePhoneCall = 'PARTNER_CARE_PHONE_CALL',
//   PartnerCarePhysicalNewsletter = 'PARTNER_CARE_PHYSICAL_NEWSLETTER',
//   PartnerCarePrayerRequest = 'PARTNER_CARE_PRAYER_REQUEST',
//   PartnerCareSocialMedia = 'PARTNER_CARE_SOCIAL_MEDIA',
//   PartnerCareTextMessage = 'PARTNER_CARE_TEXT_MESSAGE',
//   PartnerCareThank = 'PARTNER_CARE_THANK',
//   PartnerCareToDo = 'PARTNER_CARE_TO_DO',
//   PartnerCareUpdateInformation = 'PARTNER_CARE_UPDATE_INFORMATION',
// }

// PhaseEnum - need to add
