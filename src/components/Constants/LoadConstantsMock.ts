import { MockedResponse } from '@apollo/client/testing';
import {
  ActivityTypeEnum,
  DisplayResultEnum,
  PhaseEnum,
  PledgeFrequencyEnum,
  ResultEnum,
  StatusEnum,
} from 'src/graphql/types.generated';
import {
  LoadConstantsDocument,
  LoadConstantsQuery,
} from './LoadConstants.generated';

const LoadConstantsMock = (): MockedResponse => {
  return {
    request: {
      query: LoadConstantsDocument,
    },
    result: {
      data: loadConstantsMockData,
    },
  };
};

export const loadConstantsMockData: LoadConstantsQuery = {
  user: { id: '123', preferences: { id: '123', locale: 'en' } },
  constant: {
    status: [
      {
        id: StatusEnum.NeverContacted,
        value: 'New Connection',
      },
      {
        id: StatusEnum.AskInFuture,
        value: 'Ask in Future',
      },
      {
        id: StatusEnum.CultivateRelationship,
        value: 'Cultivate Relationship',
      },
      {
        id: StatusEnum.ContactForAppointment,
        value: 'Initiate for Appointment',
      },
      {
        id: StatusEnum.AppointmentScheduled,
        value: 'Appointment Scheduled',
      },
      {
        id: StatusEnum.CallForDecision,
        value: 'Follow Up for Decision',
      },
      {
        id: StatusEnum.PartnerFinancial,
        value: 'Partner - Financial',
      },
      {
        id: StatusEnum.PartnerSpecial,
        value: 'Partner - Special',
      },
      {
        id: StatusEnum.PartnerPray,
        value: 'Partner - Pray',
      },
      {
        id: StatusEnum.NotInterested,
        value: 'Not Interested',
      },
      {
        id: StatusEnum.Unresponsive,
        value: 'Unresponsive',
      },
      {
        id: StatusEnum.NeverAsk,
        value: 'Never Ask',
      },
      {
        id: StatusEnum.ResearchAbandoned,
        value: 'Research Abandoned',
      },
      {
        id: StatusEnum.ExpiredReferral,
        value: 'Expired Connection',
      },
      {
        id: StatusEnum.ResearchContactInfo,
        value: 'Research Contact Info',
      },
    ],
    activities: [
      {
        action: 'Phone Call',
        id: ActivityTypeEnum.InitiationPhoneCall,
        name: 'Phone call to initiate appointment',
        value: 'Initiation - Phone Call',
      },
      {
        action: 'Email',
        id: ActivityTypeEnum.InitiationEmail,
        name: 'Email to initiate',
        value: 'Initiation - Email',
      },
      {
        action: 'Text Message',
        id: ActivityTypeEnum.InitiationTextMessage,
        name: 'Text message to initiate',
        value: 'Initiation - Text Message',
      },
      {
        action: 'Social Media Message',
        id: ActivityTypeEnum.InitiationSocialMedia,
        name: 'Social media message to initiate',
        value: 'Initiation - Social Media Message',
      },
      {
        action: 'Letter',
        id: ActivityTypeEnum.InitiationLetter,
        name: 'Letter to initiate',
        value: 'Initiation - Letter',
      },
      {
        action: 'Special Gift Appeal',
        id: ActivityTypeEnum.InitiationSpecialGiftAppeal,
        name: 'Special gift appeal',
        value: 'Initiation - Special Gift Appeal',
      },
      {
        action: 'In Person',
        id: ActivityTypeEnum.InitiationInPerson,
        name: 'Initiate in person',
        value: 'Initiation - In Person',
      },
      {
        action: 'In Person',
        id: ActivityTypeEnum.AppointmentInPerson,
        name: 'In person appointment',
        value: 'Appointment - In Person',
      },
      {
        action: 'Phone Call',
        id: ActivityTypeEnum.AppointmentPhoneCall,
        name: 'phone appointment',
        value: 'Appointment - Phone Call',
      },
      {
        action: 'Video Call',
        id: ActivityTypeEnum.AppointmentVideoCall,
        name: 'video appointment',
        value: 'Appointment - Video Call',
      },
      {
        action: 'Phone Call',
        id: ActivityTypeEnum.FollowUpPhoneCall,
        name: 'phone call to follow up',
        value: 'Follow Up - Phone Call',
      },
      {
        action: 'Email',
        id: ActivityTypeEnum.FollowUpEmail,
        name: 'email to follow up',
        value: 'Follow Up - Email',
      },
      {
        action: 'Text Message',
        id: ActivityTypeEnum.FollowUpTextMessage,
        name: 'text message to follow up',
        value: 'Follow Up - Text Message',
      },
      {
        action: 'Social Media Message',
        id: ActivityTypeEnum.FollowUpSocialMedia,
        name: 'social media message to follow up',
        value: 'Follow Up - Social Media Message',
      },
      {
        action: 'In Person',
        id: ActivityTypeEnum.FollowUpInPerson,
        name: 'follow up in person',
        value: 'Follow Up - In Person',
      },
      {
        action: 'Phone Call',
        id: ActivityTypeEnum.PartnerCarePhoneCall,
        name: 'call partner for cultivation',
        value: 'Partner Care - Phone Call',
      },
      {
        action: 'Email',
        id: ActivityTypeEnum.PartnerCareEmail,
        name: 'email partner for cultivation',
        value: 'Partner Care - Email',
      },
      {
        action: 'Text Message',
        id: ActivityTypeEnum.PartnerCareTextMessage,
        name: 'text message partner for cultivation',
        value: 'Partner Care - Text Message',
      },
      {
        action: 'Social Media Message',
        id: ActivityTypeEnum.PartnerCareSocialMedia,
        name: 'social media message for cultivation',
        value: 'Partner Care - Social Media Message',
      },
      {
        action: 'In Person',
        id: ActivityTypeEnum.PartnerCareInPerson,
        name: 'connect in person for cultivation',
        value: 'Partner Care - In Person',
      },
      {
        action: 'Thank',
        id: ActivityTypeEnum.PartnerCareThank,
        name: 'send thank you note',
        value: 'Partner Care - Thank',
      },
      {
        action: 'Digital Newsletter',
        id: ActivityTypeEnum.PartnerCareDigitalNewsletter,
        name: 'send digital newsletter',
        value: 'Partner Care - Digital Newsletter',
      },
      {
        action: 'Physical Newsletter',
        id: ActivityTypeEnum.PartnerCarePhysicalNewsletter,
        name: 'send physical newsletter',
        value: 'Partner Care - Physical Newsletter',
      },
      {
        action: 'Prayer Request',
        id: ActivityTypeEnum.PartnerCarePrayerRequest,
        name: 'ask for or receive prayer request',
        value: 'Partner Care - Prayer Request',
      },
      {
        action: 'Update Information',
        id: ActivityTypeEnum.PartnerCareUpdateInformation,
        name: 'update partner information',
        value: 'Partner Care - Update Information',
      },
      {
        action: 'To Do',
        id: ActivityTypeEnum.PartnerCareToDo,
        name: 'To Do',
        value: 'Partner Care - To Do',
      },
    ],
    displayResults: [
      {
        id: 'INITIATION_RESULT_NO_RESPONSE',
        value: 'No Response Yet',
      },
      {
        id: 'INITIATION_RESULT_CIRCLE_BACK',
        value: 'Can not meet right now - circle back',
      },
      {
        id: 'INITIATION_RESULT_APPOINTMENT_SCHEDULED',
        value: 'Appointment Scheduled',
      },
      {
        id: 'INITIATION_RESULT_NOT_INTERESTED',
        value: 'Not Interested',
      },
      {
        id: 'FOLLOW_UP_RESULT_NO_RESPONSE',
        value: 'No Response Yet',
      },
      {
        id: 'FOLLOW_UP_RESULT_PARTNER_FINANCIAL',
        value: 'Partner - Financial',
      },
      {
        id: 'FOLLOW_UP_RESULT_PARTNER_SPECIAL',
        value: 'Partner - Special',
      },
      {
        id: 'FOLLOW_UP_RESULT_PARTNER_PRAY',
        value: 'Partner - Pray',
      },
      {
        id: 'FOLLOW_UP_RESULT_NOT_INTERESTED',
        value: 'Not Interested',
      },
      {
        id: 'APPOINTMENT_RESULT_CANCELLED',
        value: 'Cancelled',
      },
      {
        id: 'APPOINTMENT_RESULT_FOLLOW_UP',
        value: 'Follow Up',
      },
      {
        id: 'APPOINTMENT_RESULT_PARTNER_FINANCIAL',
        value: 'Partner - Financial',
      },
      {
        id: 'APPOINTMENT_RESULT_PARTNER_SPECIAL',
        value: 'Partner - Special',
      },
      {
        id: 'APPOINTMENT_RESULT_PARTNER_PRAY',
        value: 'Partner - Pray',
      },
      {
        id: 'APPOINTMENT_RESULT_NOT_INTERESTED',
        value: 'Not Interested',
      },
      {
        id: 'PARTNER_CARE_COMPLETED',
        value: 'Completed',
      },
    ],

    phases: [
      {
        contactStatuses: [
          StatusEnum.NeverContacted,
          StatusEnum.AskInFuture,
          StatusEnum.ResearchContactInfo,
          StatusEnum.CultivateRelationship,
        ],
        id: PhaseEnum.Connection,
        name: 'Connection',
        results: {
          resultOptions: [],
          tags: null,
        },
        tasks: [],
      },
      {
        contactStatuses: [StatusEnum.ContactForAppointment],
        id: PhaseEnum.Initiation,
        name: 'Initiation',
        results: {
          resultOptions: [
            {
              dbResult: [
                {
                  result: ResultEnum.Attempted,
                  task: ActivityTypeEnum.InitiationPhoneCall,
                },
                {
                  result: ResultEnum.Completed,
                  task: ActivityTypeEnum.InitiationEmail,
                },
                {
                  result: ResultEnum.Completed,
                  task: ActivityTypeEnum.InitiationTextMessage,
                },
                {
                  result: ResultEnum.Completed,
                  task: ActivityTypeEnum.InitiationSocialMedia,
                },
                {
                  result: ResultEnum.Completed,
                  task: ActivityTypeEnum.InitiationLetter,
                },
                {
                  result: ResultEnum.Completed,
                  task: ActivityTypeEnum.InitiationSpecialGiftAppeal,
                },
                {
                  result: ResultEnum.Completed,
                  task: ActivityTypeEnum.InitiationInPerson,
                },
              ],
              name: DisplayResultEnum.InitiationResultNoResponse,
              value: 'No Response Yet',
              suggestedContactStatus: null,
              suggestedNextActions: [
                ActivityTypeEnum.InitiationPhoneCall,
                ActivityTypeEnum.InitiationEmail,
                ActivityTypeEnum.InitiationTextMessage,
                ActivityTypeEnum.InitiationSocialMedia,
                ActivityTypeEnum.InitiationLetter,
                ActivityTypeEnum.InitiationSpecialGiftAppeal,
                ActivityTypeEnum.InitiationInPerson,
              ],
            },
            {
              dbResult: [
                {
                  result: ResultEnum.Completed,
                  task: ActivityTypeEnum.InitiationPhoneCall,
                },
                {
                  result: ResultEnum.Received,
                  task: ActivityTypeEnum.InitiationEmail,
                },
                {
                  result: ResultEnum.Received,
                  task: ActivityTypeEnum.InitiationTextMessage,
                },
                {
                  result: ResultEnum.Received,
                  task: ActivityTypeEnum.InitiationSocialMedia,
                },
                {
                  result: ResultEnum.Received,
                  task: ActivityTypeEnum.InitiationLetter,
                },
                {
                  result: ResultEnum.Received,
                  task: ActivityTypeEnum.InitiationSpecialGiftAppeal,
                },
                {
                  result: ResultEnum.Completed,
                  task: ActivityTypeEnum.InitiationInPerson,
                },
              ],
              name: DisplayResultEnum.InitiationResultCircleBack,
              value: 'Can not meet right now - circle back',
              suggestedContactStatus: null,
              suggestedNextActions: [
                ActivityTypeEnum.InitiationPhoneCall,
                ActivityTypeEnum.InitiationEmail,
                ActivityTypeEnum.InitiationTextMessage,
                ActivityTypeEnum.InitiationSocialMedia,
                ActivityTypeEnum.InitiationLetter,
                ActivityTypeEnum.InitiationSpecialGiftAppeal,
                ActivityTypeEnum.InitiationInPerson,
              ],
            },
            {
              dbResult: [
                {
                  result: ResultEnum.Completed,
                  task: ActivityTypeEnum.InitiationPhoneCall,
                },
                {
                  result: ResultEnum.Completed,
                  task: ActivityTypeEnum.InitiationEmail,
                },
                {
                  result: ResultEnum.Completed,
                  task: ActivityTypeEnum.InitiationTextMessage,
                },
                {
                  result: ResultEnum.Completed,
                  task: ActivityTypeEnum.InitiationSocialMedia,
                },
                {
                  result: ResultEnum.Completed,
                  task: ActivityTypeEnum.InitiationLetter,
                },
                {
                  result: ResultEnum.Completed,
                  task: ActivityTypeEnum.InitiationSpecialGiftAppeal,
                },
                {
                  result: ResultEnum.Completed,
                  task: ActivityTypeEnum.InitiationInPerson,
                },
              ],
              name: DisplayResultEnum.InitiationResultAppointmentScheduled,
              value: 'Appointment Scheduled',
              suggestedContactStatus: StatusEnum.AppointmentScheduled,
              suggestedNextActions: [
                ActivityTypeEnum.AppointmentInPerson,
                ActivityTypeEnum.AppointmentPhoneCall,
                ActivityTypeEnum.AppointmentVideoCall,
              ],
            },
            {
              dbResult: [
                {
                  result: ResultEnum.Completed,
                  task: ActivityTypeEnum.InitiationPhoneCall,
                },
                {
                  result: ResultEnum.Received,
                  task: ActivityTypeEnum.InitiationEmail,
                },
                {
                  result: ResultEnum.Received,
                  task: ActivityTypeEnum.InitiationTextMessage,
                },
                {
                  result: ResultEnum.Received,
                  task: ActivityTypeEnum.InitiationSocialMedia,
                },
                {
                  result: ResultEnum.Received,
                  task: ActivityTypeEnum.InitiationLetter,
                },
                {
                  result: ResultEnum.Received,
                  task: ActivityTypeEnum.InitiationSpecialGiftAppeal,
                },
                {
                  result: ResultEnum.Completed,
                  task: ActivityTypeEnum.InitiationInPerson,
                },
              ],
              name: DisplayResultEnum.InitiationResultNotInterested,
              value: 'Not Interested',
              suggestedContactStatus: StatusEnum.NotInterested,
              suggestedNextActions: [],
            },
          ],
          tags: null,
        },
        tasks: [
          ActivityTypeEnum.InitiationPhoneCall,
          ActivityTypeEnum.InitiationEmail,
          ActivityTypeEnum.InitiationTextMessage,
          ActivityTypeEnum.InitiationSocialMedia,
          ActivityTypeEnum.InitiationLetter,
          ActivityTypeEnum.InitiationSpecialGiftAppeal,
          ActivityTypeEnum.InitiationInPerson,
        ],
      },
      {
        contactStatuses: [StatusEnum.AppointmentScheduled],
        id: PhaseEnum.Appointment,
        name: 'Appointment',
        results: {
          resultOptions: [
            {
              dbResult: [
                {
                  result: ResultEnum.Attempted,
                  task: ActivityTypeEnum.AppointmentInPerson,
                },
                {
                  result: ResultEnum.Attempted,
                  task: ActivityTypeEnum.AppointmentVideoCall,
                },
                {
                  result: ResultEnum.Attempted,
                  task: ActivityTypeEnum.AppointmentPhoneCall,
                },
              ],
              name: DisplayResultEnum.AppointmentResultCancelled,
              value: 'Cancelled',
              suggestedContactStatus: StatusEnum.ContactForAppointment,
              suggestedNextActions: [
                ActivityTypeEnum.InitiationPhoneCall,
                ActivityTypeEnum.InitiationEmail,
                ActivityTypeEnum.InitiationTextMessage,
                ActivityTypeEnum.InitiationSocialMedia,
                ActivityTypeEnum.InitiationLetter,
                ActivityTypeEnum.InitiationSpecialGiftAppeal,
                ActivityTypeEnum.InitiationInPerson,
              ],
            },
            {
              dbResult: [
                {
                  result: ResultEnum.Completed,
                  task: ActivityTypeEnum.AppointmentInPerson,
                },
                {
                  result: ResultEnum.Completed,
                  task: ActivityTypeEnum.AppointmentVideoCall,
                },
                {
                  result: ResultEnum.Completed,
                  task: ActivityTypeEnum.AppointmentPhoneCall,
                },
              ],
              name: DisplayResultEnum.AppointmentResultFollowUp,
              value: 'Follow Up',
              suggestedContactStatus: StatusEnum.CallForDecision,
              suggestedNextActions: [
                ActivityTypeEnum.FollowUpPhoneCall,
                ActivityTypeEnum.FollowUpEmail,
                ActivityTypeEnum.FollowUpTextMessage,
                ActivityTypeEnum.FollowUpSocialMedia,
                ActivityTypeEnum.FollowUpInPerson,
              ],
            },
            {
              dbResult: [
                {
                  result: ResultEnum.Completed,
                  task: ActivityTypeEnum.AppointmentInPerson,
                },
                {
                  result: ResultEnum.Completed,
                  task: ActivityTypeEnum.AppointmentVideoCall,
                },
                {
                  result: ResultEnum.Completed,
                  task: ActivityTypeEnum.AppointmentPhoneCall,
                },
              ],
              name: DisplayResultEnum.FollowUpResultPartnerFinancial,
              value: 'Partner - Financial',
              suggestedContactStatus: StatusEnum.PartnerFinancial,
              suggestedNextActions: [ActivityTypeEnum.PartnerCareThank],
            },
            {
              dbResult: [
                {
                  result: ResultEnum.Completed,
                  task: ActivityTypeEnum.AppointmentInPerson,
                },
                {
                  result: ResultEnum.Completed,
                  task: ActivityTypeEnum.AppointmentVideoCall,
                },
                {
                  result: ResultEnum.Completed,
                  task: ActivityTypeEnum.AppointmentPhoneCall,
                },
              ],
              name: DisplayResultEnum.FollowUpResultPartnerSpecial,
              value: 'Partner - Special',
              suggestedContactStatus: StatusEnum.PartnerSpecial,
              suggestedNextActions: [ActivityTypeEnum.PartnerCareThank],
            },
            {
              dbResult: [
                {
                  result: ResultEnum.Completed,
                  task: ActivityTypeEnum.AppointmentInPerson,
                },
                {
                  result: ResultEnum.Completed,
                  task: ActivityTypeEnum.AppointmentVideoCall,
                },
                {
                  result: ResultEnum.Completed,
                  task: ActivityTypeEnum.AppointmentPhoneCall,
                },
              ],
              name: DisplayResultEnum.FollowUpResultPartnerPray,
              value: 'Partner - Pray',
              suggestedContactStatus: StatusEnum.PartnerPray,
              suggestedNextActions: [ActivityTypeEnum.PartnerCareThank],
            },
            {
              dbResult: [
                {
                  result: ResultEnum.Completed,
                  task: ActivityTypeEnum.AppointmentInPerson,
                },
                {
                  result: ResultEnum.Completed,
                  task: ActivityTypeEnum.AppointmentVideoCall,
                },
                {
                  result: ResultEnum.Completed,
                  task: ActivityTypeEnum.AppointmentPhoneCall,
                },
              ],
              name: DisplayResultEnum.FollowUpResultNotInterested,
              value: 'Not Interested',
              suggestedContactStatus: StatusEnum.NotInterested,
              suggestedNextActions: [],
            },
          ],
          tags: [
            {
              id: 'asked for support',
              value: 'asked for support',
            },
            {
              id: 'asked for connections',
              value: 'asked for connections',
            },
            {
              id: 'asked for advocacy',
              value: 'asked for advocacy',
            },
            {
              id: 'asked for increase',
              value: 'asked for increase',
            },
          ],
        },
        tasks: [
          ActivityTypeEnum.AppointmentInPerson,
          ActivityTypeEnum.AppointmentPhoneCall,
          ActivityTypeEnum.AppointmentVideoCall,
        ],
      },
      {
        contactStatuses: [StatusEnum.CallForDecision],
        id: PhaseEnum.FollowUp,
        name: 'Follow-Up',
        results: {
          resultOptions: [
            {
              dbResult: [
                {
                  result: ResultEnum.Attempted,
                  task: ActivityTypeEnum.FollowUpPhoneCall,
                },
                {
                  result: ResultEnum.Completed,
                  task: ActivityTypeEnum.FollowUpEmail,
                },
                {
                  result: ResultEnum.Completed,
                  task: ActivityTypeEnum.FollowUpTextMessage,
                },
                {
                  result: ResultEnum.Completed,
                  task: ActivityTypeEnum.FollowUpSocialMedia,
                },
                {
                  result: ResultEnum.Completed,
                  task: ActivityTypeEnum.FollowUpInPerson,
                },
              ],
              name: DisplayResultEnum.InitiationResultNoResponse,
              value: 'No Response Yet',
              suggestedContactStatus: null,
              suggestedNextActions: [
                ActivityTypeEnum.FollowUpPhoneCall,
                ActivityTypeEnum.FollowUpEmail,
                ActivityTypeEnum.FollowUpTextMessage,
                ActivityTypeEnum.FollowUpSocialMedia,
                ActivityTypeEnum.FollowUpInPerson,
              ],
            },
            {
              dbResult: [
                {
                  result: ResultEnum.Completed,
                  task: ActivityTypeEnum.FollowUpPhoneCall,
                },
                {
                  result: ResultEnum.Completed,
                  task: ActivityTypeEnum.FollowUpEmail,
                },
                {
                  result: ResultEnum.Completed,
                  task: ActivityTypeEnum.FollowUpTextMessage,
                },
                {
                  result: ResultEnum.Completed,
                  task: ActivityTypeEnum.FollowUpSocialMedia,
                },
                {
                  result: ResultEnum.Completed,
                  task: ActivityTypeEnum.FollowUpInPerson,
                },
              ],
              name: DisplayResultEnum.FollowUpResultPartnerFinancial,
              value: 'Partner - Financial',
              suggestedContactStatus: StatusEnum.PartnerFinancial,
              suggestedNextActions: [ActivityTypeEnum.PartnerCareThank],
            },
            {
              dbResult: [
                {
                  result: ResultEnum.Completed,
                  task: ActivityTypeEnum.FollowUpPhoneCall,
                },
                {
                  result: ResultEnum.Completed,
                  task: ActivityTypeEnum.FollowUpEmail,
                },
                {
                  result: ResultEnum.Completed,
                  task: ActivityTypeEnum.FollowUpTextMessage,
                },
                {
                  result: ResultEnum.Completed,
                  task: ActivityTypeEnum.FollowUpSocialMedia,
                },
                {
                  result: ResultEnum.Completed,
                  task: ActivityTypeEnum.FollowUpInPerson,
                },
              ],
              name: DisplayResultEnum.FollowUpResultPartnerSpecial,
              value: 'Partner - Special',
              suggestedContactStatus: StatusEnum.PartnerSpecial,
              suggestedNextActions: [ActivityTypeEnum.PartnerCareThank],
            },
            {
              dbResult: [
                {
                  result: ResultEnum.Completed,
                  task: ActivityTypeEnum.FollowUpPhoneCall,
                },
                {
                  result: ResultEnum.Completed,
                  task: ActivityTypeEnum.FollowUpEmail,
                },
                {
                  result: ResultEnum.Completed,
                  task: ActivityTypeEnum.FollowUpTextMessage,
                },
                {
                  result: ResultEnum.Completed,
                  task: ActivityTypeEnum.FollowUpSocialMedia,
                },
                {
                  result: ResultEnum.Completed,
                  task: ActivityTypeEnum.FollowUpInPerson,
                },
              ],
              name: DisplayResultEnum.FollowUpResultPartnerPray,
              value: 'Partner - Pray',
              suggestedContactStatus: StatusEnum.PartnerPray,
              suggestedNextActions: [ActivityTypeEnum.PartnerCareThank],
            },
            {
              dbResult: [
                {
                  result: ResultEnum.Completed,
                  task: ActivityTypeEnum.FollowUpPhoneCall,
                },
                {
                  result: ResultEnum.Completed,
                  task: ActivityTypeEnum.FollowUpEmail,
                },
                {
                  result: ResultEnum.Completed,
                  task: ActivityTypeEnum.FollowUpTextMessage,
                },
                {
                  result: ResultEnum.Completed,
                  task: ActivityTypeEnum.FollowUpSocialMedia,
                },
                {
                  result: ResultEnum.Completed,
                  task: ActivityTypeEnum.FollowUpInPerson,
                },
              ],
              name: DisplayResultEnum.FollowUpResultNotInterested,
              value: 'Not Interested',
              suggestedContactStatus: StatusEnum.NotInterested,
              suggestedNextActions: [],
            },
          ],
          tags: [
            {
              id: 'Financial Support',
              value: 'Financial Support',
            },
            {
              id: 'Gift not Started',
              value: 'Gift not Started',
            },
            {
              id: 'Special Gift',
              value: 'Special Gift',
            },
            {
              id: 'Connections',
              value: 'Connections',
            },
            {
              id: 'Increase',
              value: 'Increase',
            },
          ],
        },
        tasks: [
          ActivityTypeEnum.FollowUpPhoneCall,
          ActivityTypeEnum.FollowUpEmail,
          ActivityTypeEnum.FollowUpTextMessage,
          ActivityTypeEnum.FollowUpSocialMedia,
          ActivityTypeEnum.FollowUpInPerson,
        ],
      },
      {
        contactStatuses: [
          StatusEnum.PartnerFinancial,
          StatusEnum.PartnerSpecial,
          StatusEnum.PartnerPray,
        ],
        id: PhaseEnum.PartnerCare,
        name: 'Partner Care',
        results: {
          resultOptions: [
            {
              dbResult: [
                {
                  result: ResultEnum.Completed,
                  task: ActivityTypeEnum.PartnerCarePhoneCall,
                },
                {
                  result: ResultEnum.Completed,
                  task: ActivityTypeEnum.PartnerCareEmail,
                },
                {
                  result: ResultEnum.Completed,
                  task: ActivityTypeEnum.PartnerCareTextMessage,
                },
                {
                  result: ResultEnum.Completed,
                  task: ActivityTypeEnum.PartnerCareSocialMedia,
                },
                {
                  result: ResultEnum.Completed,
                  task: ActivityTypeEnum.PartnerCareInPerson,
                },
                {
                  result: ResultEnum.Completed,
                  task: ActivityTypeEnum.PartnerCareThank,
                },
                {
                  result: ResultEnum.Completed,
                  task: ActivityTypeEnum.PartnerCareDigitalNewsletter,
                },
                {
                  result: ResultEnum.Completed,
                  task: ActivityTypeEnum.PartnerCarePhysicalNewsletter,
                },
                {
                  result: ResultEnum.Completed,
                  task: ActivityTypeEnum.PartnerCarePrayerRequest,
                },
                {
                  result: ResultEnum.Completed,
                  task: ActivityTypeEnum.PartnerCareUpdateInformation,
                },
                {
                  result: ResultEnum.Completed,
                  task: ActivityTypeEnum.PartnerCareToDo,
                },
              ],
              name: DisplayResultEnum.PartnerCareCompleted,
              value: 'Completed',
              suggestedContactStatus: null,
              suggestedNextActions: [
                ActivityTypeEnum.PartnerCarePhoneCall,
                ActivityTypeEnum.PartnerCareEmail,
                ActivityTypeEnum.PartnerCareTextMessage,
                ActivityTypeEnum.PartnerCareSocialMedia,
                ActivityTypeEnum.PartnerCareInPerson,
                ActivityTypeEnum.PartnerCareThank,
                ActivityTypeEnum.PartnerCareDigitalNewsletter,
                ActivityTypeEnum.PartnerCarePhysicalNewsletter,
                ActivityTypeEnum.PartnerCarePrayerRequest,
                ActivityTypeEnum.PartnerCareUpdateInformation,
                ActivityTypeEnum.PartnerCareToDo,
              ],
            },
          ],
          tags: null,
        },
        tasks: [
          ActivityTypeEnum.PartnerCarePhoneCall,
          ActivityTypeEnum.PartnerCareEmail,
          ActivityTypeEnum.PartnerCareTextMessage,
          ActivityTypeEnum.PartnerCareSocialMedia,
          ActivityTypeEnum.PartnerCareInPerson,
          ActivityTypeEnum.PartnerCareThank,
          ActivityTypeEnum.PartnerCareDigitalNewsletter,
          ActivityTypeEnum.PartnerCarePhysicalNewsletter,
          ActivityTypeEnum.PartnerCarePrayerRequest,
          ActivityTypeEnum.PartnerCareUpdateInformation,
          ActivityTypeEnum.PartnerCareToDo,
        ],
      },
      {
        contactStatuses: [
          StatusEnum.NotInterested,
          StatusEnum.Unresponsive,
          StatusEnum.NeverAsk,
          StatusEnum.ResearchAbandoned,
          StatusEnum.ExpiredReferral,
        ],
        id: PhaseEnum.Archive,
        name: 'Archive',
        results: {
          resultOptions: [],
          tags: null,
        },
        tasks: [],
      },
    ],
    pledgeCurrency: [
      {
        code: 'CAD',
        codeSymbolString: 'CAD ($)',
        id: 'CAD',
        key: 'CAD',
        name: 'Canadian Dollar',
        symbol: '$',
        value: 'CAD ($)',
      },
      {
        code: 'CDF',
        codeSymbolString: 'CDF (CDF)',
        id: 'CDF',
        key: 'CDF',
        name: 'Congolese Franc',
        symbol: 'CDF',
        value: 'CDF (CDF)',
      },
      {
        code: 'CHE',
        codeSymbolString: 'CHE (CHE)',
        id: 'CHE',
        key: 'CHE',
        name: 'WIR Euro',
        symbol: 'CHE',
        value: 'CHE (CHE)',
      },
      {
        code: 'USD',
        codeSymbolString: 'USD ($)',
        id: 'USD',
        key: 'USD',
        name: 'US Dollar',
        symbol: '$',
        value: 'USD ($)',
      },
      {
        code: 'EUR',
        codeSymbolString: 'EUR (€)',
        id: 'EUR',
        key: 'EUR',
        name: 'Euro',
        symbol: '€',
        value: 'EUR (€)',
      },
    ],
    pledgeFrequency: [
      {
        id: PledgeFrequencyEnum.Weekly,
        key: '0.23076923076923',
        value: 'Weekly',
      },
      {
        id: PledgeFrequencyEnum.Every_2Weeks,
        key: '0.46153846153846',
        value: 'Every 2 Weeks',
      },
      {
        id: PledgeFrequencyEnum.Monthly,
        key: '1.0',
        value: 'Monthly',
      },
      {
        id: PledgeFrequencyEnum.Every_2Months,
        key: '2.0',
        value: 'Every 2 Months',
      },
      {
        id: PledgeFrequencyEnum.Quarterly,
        key: '3.0',
        value: 'Quarterly',
      },
      {
        id: PledgeFrequencyEnum.Every_4Months,
        key: '4.0',
        value: 'Every 4 Months',
      },
      {
        id: PledgeFrequencyEnum.Every_6Months,
        key: '6.0',
        value: 'Every 6 Months',
      },
      {
        id: PledgeFrequencyEnum.Annual,
        key: '12.0',
        value: 'Annual',
      },
      {
        id: PledgeFrequencyEnum.Every_2Years,
        key: '24.0',
        value: 'Every 2 Years',
      },
    ],
    languages: [
      {
        id: 'en',
        value: 'English',
      },
      {
        id: 'elx',
        value: 'Greek',
      },
      {
        id: 'eka',
        value: 'Ekajuk',
      },
      {
        id: 'en-AU',
        value: 'Australian English',
      },
    ],
    locales: [
      {
        englishName: 'Filipino (fil)',
        nativeName: 'Filipino',
        shortName: 'fil',
      },
      {
        englishName: 'UK English (en-GB)',
        nativeName: 'UK English',
        shortName: 'en-GB',
      },
      {
        englishName: 'Latin American Spanish (es-419)',
        nativeName: 'español latinoamericano',
        shortName: 'es-419',
      },
    ],
    times: [
      {
        key: 0,
        value: '12:00 AM',
      },
      {
        key: 5,
        value: '5:00 AM',
      },
      {
        key: null,
        value: 'Immediately',
      },
    ],
  },
};

export default LoadConstantsMock;
