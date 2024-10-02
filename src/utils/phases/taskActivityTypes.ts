import { ActivityTypeEnum, PhaseEnum } from 'src/graphql/types.generated';

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

export const getActivitiesByPhaseType = (
  phase: PhaseEnum | string,
): ActivityTypeEnum[] => {
  switch (phase) {
    case PhaseEnum.Appointment:
      return [
        ActivityTypeEnum.AppointmentInPerson,
        ActivityTypeEnum.AppointmentPhoneCall,
        ActivityTypeEnum.AppointmentVideoCall,
      ];
    case PhaseEnum.FollowUp:
      return [
        ActivityTypeEnum.FollowUpEmail,
        ActivityTypeEnum.FollowUpInPerson,
        ActivityTypeEnum.FollowUpPhoneCall,
        ActivityTypeEnum.FollowUpSocialMedia,
        ActivityTypeEnum.FollowUpTextMessage,
      ];
    case PhaseEnum.Initiation:
      return [
        ActivityTypeEnum.InitiationEmail,
        ActivityTypeEnum.InitiationInPerson,
        ActivityTypeEnum.InitiationLetter,
        ActivityTypeEnum.InitiationPhoneCall,
        ActivityTypeEnum.InitiationSocialMedia,
        ActivityTypeEnum.InitiationSpecialGiftAppeal,
        ActivityTypeEnum.InitiationTextMessage,
      ];
    case PhaseEnum.PartnerCare:
      return [
        ActivityTypeEnum.PartnerCareDigitalNewsletter,
        ActivityTypeEnum.PartnerCareEmail,
        ActivityTypeEnum.PartnerCareInPerson,
        ActivityTypeEnum.PartnerCarePhoneCall,
        ActivityTypeEnum.PartnerCarePhysicalNewsletter,
        ActivityTypeEnum.PartnerCarePrayerRequest,
        ActivityTypeEnum.PartnerCareSocialMedia,
        ActivityTypeEnum.PartnerCareTextMessage,
        ActivityTypeEnum.PartnerCareThank,
        ActivityTypeEnum.PartnerCareToDo,
        ActivityTypeEnum.PartnerCareUpdateInformation,
      ];
    default:
      return [
        ActivityTypeEnum.AppointmentInPerson,
        ActivityTypeEnum.AppointmentPhoneCall,
        ActivityTypeEnum.AppointmentVideoCall,
        ActivityTypeEnum.FollowUpEmail,
        ActivityTypeEnum.FollowUpInPerson,
        ActivityTypeEnum.FollowUpPhoneCall,
        ActivityTypeEnum.FollowUpSocialMedia,
        ActivityTypeEnum.FollowUpTextMessage,
        ActivityTypeEnum.InitiationEmail,
        ActivityTypeEnum.InitiationInPerson,
        ActivityTypeEnum.InitiationLetter,
        ActivityTypeEnum.InitiationPhoneCall,
        ActivityTypeEnum.InitiationSocialMedia,
        ActivityTypeEnum.InitiationSpecialGiftAppeal,
        ActivityTypeEnum.InitiationTextMessage,
        ActivityTypeEnum.PartnerCareDigitalNewsletter,
        ActivityTypeEnum.PartnerCareEmail,
        ActivityTypeEnum.PartnerCareInPerson,
        ActivityTypeEnum.PartnerCarePhoneCall,
        ActivityTypeEnum.PartnerCarePhysicalNewsletter,
        ActivityTypeEnum.PartnerCarePrayerRequest,
        ActivityTypeEnum.PartnerCareSocialMedia,
        ActivityTypeEnum.PartnerCareTextMessage,
        ActivityTypeEnum.PartnerCareThank,
        ActivityTypeEnum.PartnerCareToDo,
        ActivityTypeEnum.PartnerCareUpdateInformation,
      ];
  }
};

export const getPhaseByActivityType = (
  activity?: ActivityTypeEnum | null,
): PhaseEnum | null => {
  switch (activity) {
    case ActivityTypeEnum.AppointmentInPerson:
    case ActivityTypeEnum.AppointmentPhoneCall:
    case ActivityTypeEnum.AppointmentVideoCall:
      return PhaseEnum.Appointment;

    case ActivityTypeEnum.FollowUpEmail:
    case ActivityTypeEnum.FollowUpInPerson:
    case ActivityTypeEnum.FollowUpPhoneCall:
    case ActivityTypeEnum.FollowUpSocialMedia:
    case ActivityTypeEnum.FollowUpTextMessage:
      return PhaseEnum.FollowUp;

    case ActivityTypeEnum.InitiationEmail:
    case ActivityTypeEnum.InitiationInPerson:
    case ActivityTypeEnum.InitiationLetter:
    case ActivityTypeEnum.InitiationPhoneCall:
    case ActivityTypeEnum.InitiationSocialMedia:
    case ActivityTypeEnum.InitiationSpecialGiftAppeal:
    case ActivityTypeEnum.InitiationTextMessage:
      return PhaseEnum.Initiation;

    case ActivityTypeEnum.PartnerCareDigitalNewsletter:
    case ActivityTypeEnum.PartnerCareEmail:
    case ActivityTypeEnum.PartnerCareInPerson:
    case ActivityTypeEnum.PartnerCarePhoneCall:
    case ActivityTypeEnum.PartnerCarePhysicalNewsletter:
    case ActivityTypeEnum.PartnerCarePrayerRequest:
    case ActivityTypeEnum.PartnerCareSocialMedia:
    case ActivityTypeEnum.PartnerCareTextMessage:
    case ActivityTypeEnum.PartnerCareThank:
    case ActivityTypeEnum.PartnerCareToDo:
    case ActivityTypeEnum.PartnerCareUpdateInformation:
      return PhaseEnum.PartnerCare;

    default:
      return null;
  }
};
