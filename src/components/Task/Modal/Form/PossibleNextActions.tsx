import {
  ActivityTypeEnum,
  DisplayResultEnum,
  Phase,
} from 'src/graphql/types.generated';

// TODO need to add 'Update Information' & Video Call as type
// Update Information
// Video Call
const defaultActivities: ActivityTypeEnum[] = [
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
export const possibleNextActions = (
  phaseData: Phase | null,
  resultName: DisplayResultEnum | null,
  activity: ActivityTypeEnum | null,
): ActivityTypeEnum[] => {
  if (!phaseData || !resultName || !activity) return defaultActivities;

  const result = phaseData.results?.resultOptions
    ? phaseData.results.resultOptions.find(
        (result) => result.name?.toLowerCase() === resultName.toLowerCase(),
      )
    : null;

  return result?.suggestedNextActions || defaultActivities;
};
