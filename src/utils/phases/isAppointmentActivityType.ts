import { ActivityTypeEnum } from 'src/graphql/types.generated';

export const isAppointmentActivityType = (
  activity?: ActivityTypeEnum | null,
) => {
  if (!activity) {
    return null;
  }
  return (
    [
      ActivityTypeEnum.AppointmentInPerson,
      ActivityTypeEnum.AppointmentVideoCall,
      ActivityTypeEnum.AppointmentPhoneCall,
      ActivityTypeEnum.FollowUpInPerson,
      ActivityTypeEnum.InitiationInPerson,
      ActivityTypeEnum.PartnerCareInPerson,
    ].indexOf(activity) > -1
  );
};
