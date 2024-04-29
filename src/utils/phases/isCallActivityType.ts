import { ActivityTypeEnum } from 'src/graphql/types.generated';

export const isCallActivityType = (activity?: ActivityTypeEnum) => {
  if (!activity) {
    return null;
  }
  return (
    [
      ActivityTypeEnum.AppointmentPhoneCall,
      ActivityTypeEnum.AppointmentVideoCall,
      ActivityTypeEnum.FollowUpPhoneCall,
      ActivityTypeEnum.InitiationPhoneCall,
      ActivityTypeEnum.PartnerCarePhoneCall,
    ].indexOf(activity) > -1
  );
};
