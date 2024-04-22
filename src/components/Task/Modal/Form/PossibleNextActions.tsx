import { ActivityTypeEnum, ResultEnum } from 'src/graphql/types.generated';
import { TaskPhase } from 'src/hooks/useContactPhaseData';
import { NewResultEnum } from 'src/utils/contacts/getContactPhaseDataMock';

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
  phaseData: TaskPhase | null,
  resultName: (ResultEnum | NewResultEnum) | null,
  activity: ActivityTypeEnum | null,
): ActivityTypeEnum[] => {
  if (!phaseData || !resultName || !activity) return defaultActivities;

  const result = phaseData?.results?.resultOptions
    ? phaseData.results.resultOptions.find(
        (result) => result.name.id?.toLowerCase() === resultName.toLowerCase(),
      )
    : null;

  const nextActions = result
    ? result.suggestedNextActions?.map(
        (nextAction) => nextAction.id as ActivityTypeEnum,
      ) ?? defaultActivities
    : defaultActivities;

  return nextActions;
};
