import { MockedResponse } from '@apollo/client/testing';
import { ActivityTypeEnum } from 'src/graphql/types.generated';
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

export const loadConstantsMockData = {
  constant: {
    __typename: 'Constant',
    statuses: [
      {
        id: 'NEVER_CONTACTED',
        value: 'New Connection',
      },
      {
        id: 'ASK_IN_FUTURE',
        value: 'Ask in Future',
      },
      {
        id: 'CULTIVATE_RELATIONSHIP',
        value: 'Cultivate Relationship',
      },
      {
        id: 'CONTACT_FOR_APPOINTMENT',
        value: 'Initiate for Appointment',
      },
      {
        id: 'APPOINTMENT_SCHEDULED',
        value: 'Appointment Scheduled',
      },
      {
        id: 'CALL_FOR_DECISION',
        value: 'Follow Up for Decision',
      },
      {
        id: 'PARTNER_FINANCIAL',
        value: 'Partner - Financial',
      },
      {
        id: 'PARTNER_SPECIAL',
        value: 'Partner - Special',
      },
      {
        id: 'PARTNER_PRAY',
        value: 'Partner - Pray',
      },
      {
        id: 'NOT_INTERESTED',
        value: 'Not Interested',
      },
      {
        id: 'UNRESPONSIVE',
        value: 'Unresponsive',
      },
      {
        id: 'NEVER_ASK',
        value: 'Never Ask',
      },
      {
        id: 'RESEARCH_ABANDONED',
        value: 'Research Abandoned',
      },
      {
        id: 'EXPIRED_REFERRAL',
        value: 'Expired Connection',
      },
      {
        id: 'RESEARCH_CONTACT_INFO',
        value: 'Research Contact Info',
      },
    ],
    activities: [
      {
        __typename: 'ActivitiesConstant',
        id: ActivityTypeEnum.InitiationPhoneCall,
        value: 'Initiation - Phone Call',
        name: 'phone call to initiate appointment',
      },
      {
        __typename: 'ActivitiesConstant',
        id: ActivityTypeEnum.InitiationPhoneCall,
        value: 'Initiation - Email',
        name: 'email to initiate',
      },
      {
        __typename: 'ActivitiesConstant',
        id: ActivityTypeEnum.InitiationTextMessage,
        value: 'Initiation - Text Message',
        name: 'text message to initiate',
      },
      {
        __typename: 'ActivitiesConstant',
        id: ActivityTypeEnum.InitiationSocialMedia,
        value: 'Initiation - Social Media',
        name: 'social media message to initiate',
      },
      {
        __typename: 'ActivitiesConstant',
        id: ActivityTypeEnum.InitiationLetter,
        value: 'Initiation - Letter',
        name: 'letter to initiate',
      },
      {
        __typename: 'ActivitiesConstant',
        id: ActivityTypeEnum.InitiationSpecialGiftAppeal,
        value: 'Initiation - Special Gift Appeal',
        name: 'special gift appeal',
      },
      {
        __typename: 'ActivitiesConstant',
        id: ActivityTypeEnum.InitiationInPerson,
        value: 'Initiation - In Person',
        name: 'initiate in person',
      },
      {
        __typename: 'ActivitiesConstant',
        id: ActivityTypeEnum.AppointmentInPerson,
        value: 'Appointment - In Person',
        name: 'in person appointment',
      },
      {
        __typename: 'ActivitiesConstant',
        id: ActivityTypeEnum.AppointmentPhoneCall,
        value: 'Appointment - Phone Call',
        name: 'video appointment',
      },
      {
        __typename: 'ActivitiesConstant',
        id: ActivityTypeEnum.AppointmentVideoCall,
        value: 'Appointment - Video Call',
        name: 'phone appointment',
      },
      {
        __typename: 'ActivitiesConstant',
        id: ActivityTypeEnum.FollowUpPhoneCall,
        value: 'Follow Up - Phone Call',
        name: 'phone call to follow up',
      },
      {
        __typename: 'ActivitiesConstant',
        id: ActivityTypeEnum.FollowUpEmail,
        value: 'Follow Up - Email',
        name: 'email to follow up',
      },
      {
        __typename: 'ActivitiesConstant',
        id: ActivityTypeEnum.FollowUpTextMessage,
        value: 'Follow Up - Text Message',
        name: 'text message to follow up',
      },
      {
        __typename: 'ActivitiesConstant',
        id: ActivityTypeEnum.FollowUpSocialMedia,
        value: 'Follow Up - Social Media',
        name: 'social media message to follow up',
      },
      {
        __typename: 'ActivitiesConstant',
        id: ActivityTypeEnum.FollowUpInPerson,
        value: 'Follow Up - In Person',
        name: 'follow up in person',
      },
      {
        __typename: 'ActivitiesConstant',
        id: ActivityTypeEnum.PartnerCarePhoneCall,
        value: 'Partner Care - Phone Call',
        name: 'call partner for cultivation',
      },
      {
        __typename: 'ActivitiesConstant',
        id: ActivityTypeEnum.PartnerCareEmail,
        value: 'Partner Care - Email',
        name: 'email partner for cultivation',
      },
      {
        __typename: 'ActivitiesConstant',
        id: ActivityTypeEnum.PartnerCareTextMessage,
        value: 'Partner Care - Text Message',
        name: 'text message partner for cultivation',
      },
      {
        __typename: 'ActivitiesConstant',
        id: ActivityTypeEnum.PartnerCareSocialMedia,
        value: 'Partner Care - Social Media',
        name: 'social media message for cultivation',
      },
      {
        __typename: 'ActivitiesConstant',
        id: ActivityTypeEnum.PartnerCareInPerson,
        value: 'Partner Care - In Person',
        name: 'connect in person for cultivation',
      },
      {
        __typename: 'ActivitiesConstant',
        id: ActivityTypeEnum.PartnerCareThank,
        value: 'Partner Care - Thank',
        name: 'send thank you note',
      },
      {
        __typename: 'ActivitiesConstant',
        id: ActivityTypeEnum.PartnerCareDigitalNewsletter,
        value: 'Partner Care - Digital Newsletter',
        name: 'send digital newsletter',
      },
      {
        __typename: 'ActivitiesConstant',
        id: ActivityTypeEnum.PartnerCarePhysicalNewsletter,
        value: 'Partner Care - Physical Newsletter',
        name: 'send physical newsletter',
      },
      {
        __typename: 'ActivitiesConstant',
        id: ActivityTypeEnum.PartnerCarePrayerRequest,
        value: 'Partner Care - Prayer Request',
        name: 'ask for or receive prayer request',
      },
      {
        __typename: 'ActivitiesConstant',
        id: ActivityTypeEnum.PartnerCareUpdateInformation,
        value: 'Partner Care - Update Information',
        name: 'update partner information',
      },
      {
        __typename: 'ActivitiesConstant',
        id: ActivityTypeEnum.PartnerCareToDo,
        value: 'Partner Care - To Do',
        name: 'to do',
      },
    ],

    phases: [
      {
        __typename: 'Phase',
        id: 'CONNECTION',
        name: 'Connection',
        results: {
          __typename: 'Result',
          resultOptions: [],
          tags: null,
        },
        contactStatuses: [
          'NEVER_CONTACTED',
          'ASK_IN_FUTURE',
          'RESEARCH_CONTACT_INFO',
          'CULTIVATE_RELATIONSHIP',
        ],
        tasks: [],
      },
      {
        __typename: 'Phase',
        id: 'INITIATION',
        name: 'Initiation',
        results: {
          __typename: 'Result',
          resultOptions: [
            {
              __typename: 'ResultOption',
              dbResult: [
                {
                  __typename: 'TaskResultPair',
                  task: 'INITIATION_PHONE_CALL',
                  result: 'ATTEMPTED',
                },
                {
                  __typename: 'TaskResultPair',
                  task: 'INITIATION_EMAIL',
                  result: 'COMPLETED',
                },
                {
                  __typename: 'TaskResultPair',
                  task: 'INITIATION_TEXT_MESSAGE',
                  result: 'COMPLETED',
                },
                {
                  __typename: 'TaskResultPair',
                  task: 'INITIATION_SOCIAL_MEDIA',
                  result: 'COMPLETED',
                },
                {
                  __typename: 'TaskResultPair',
                  task: 'INITIATION_LETTER',
                  result: 'COMPLETED',
                },
                {
                  __typename: 'TaskResultPair',
                  task: 'INITIATION_SPECIAL_GIFT_APPEAL',
                  result: 'COMPLETED',
                },
                {
                  __typename: 'TaskResultPair',
                  task: 'INITIATION_IN_PERSON',
                  result: 'COMPLETED',
                },
              ],
              name: 'INITIATION_RESULT_NO_RESPONSE',
              suggestedContactStatus: null,
              suggestedNextActions: [
                'INITIATION_PHONE_CALL',
                'INITIATION_EMAIL',
                'INITIATION_TEXT_MESSAGE',
                'INITIATION_SOCIAL_MEDIA',
                'INITIATION_LETTER',
                'INITIATION_SPECIAL_GIFT_APPEAL',
                'INITIATION_IN_PERSON',
              ],
            },
            {
              __typename: 'ResultOption',
              dbResult: [
                {
                  __typename: 'TaskResultPair',
                  task: 'INITIATION_PHONE_CALL',
                  result: 'COMPLETED',
                },
                {
                  __typename: 'TaskResultPair',
                  task: 'INITIATION_EMAIL',
                  result: 'RECEIVED',
                },
                {
                  __typename: 'TaskResultPair',
                  task: 'INITIATION_TEXT_MESSAGE',
                  result: 'RECEIVED',
                },
                {
                  __typename: 'TaskResultPair',
                  task: 'INITIATION_SOCIAL_MEDIA',
                  result: 'RECEIVED',
                },
                {
                  __typename: 'TaskResultPair',
                  task: 'INITIATION_LETTER',
                  result: 'RECEIVED',
                },
                {
                  __typename: 'TaskResultPair',
                  task: 'INITIATION_SPECIAL_GIFT_APPEAL',
                  result: 'RECEIVED',
                },
                {
                  __typename: 'TaskResultPair',
                  task: 'INITIATION_IN_PERSON',
                  result: 'COMPLETED',
                },
              ],
              name: 'INITIATION_RESULT_CIRCLE_BACK',
              suggestedContactStatus: null,
              suggestedNextActions: [
                'INITIATION_PHONE_CALL',
                'INITIATION_EMAIL',
                'INITIATION_TEXT_MESSAGE',
                'INITIATION_SOCIAL_MEDIA',
                'INITIATION_LETTER',
                'INITIATION_SPECIAL_GIFT_APPEAL',
                'INITIATION_IN_PERSON',
              ],
            },
            {
              __typename: 'ResultOption',
              dbResult: [
                {
                  __typename: 'TaskResultPair',
                  task: 'INITIATION_PHONE_CALL',
                  result: 'COMPLETED',
                },
                {
                  __typename: 'TaskResultPair',
                  task: 'INITIATION_EMAIL',
                  result: 'COMPLETED',
                },
                {
                  __typename: 'TaskResultPair',
                  task: 'INITIATION_TEXT_MESSAGE',
                  result: 'COMPLETED',
                },
                {
                  __typename: 'TaskResultPair',
                  task: 'INITIATION_SOCIAL_MEDIA',
                  result: 'COMPLETED',
                },
                {
                  __typename: 'TaskResultPair',
                  task: 'INITIATION_LETTER',
                  result: 'COMPLETED',
                },
                {
                  __typename: 'TaskResultPair',
                  task: 'INITIATION_SPECIAL_GIFT_APPEAL',
                  result: 'COMPLETED',
                },
                {
                  __typename: 'TaskResultPair',
                  task: 'INITIATION_IN_PERSON',
                  result: 'COMPLETED',
                },
              ],
              name: 'INITIATION_RESULT_APPOINTMENT_SCHEDULED',
              suggestedContactStatus: 'APPOINTMENT_SCHEDULED',
              suggestedNextActions: [
                'APPOINTMENT_IN_PERSON',
                'APPOINTMENT_PHONE_CALL',
                'APPOINTMENT_VIDEO_CALL',
              ],
            },
            {
              __typename: 'ResultOption',
              dbResult: [
                {
                  __typename: 'TaskResultPair',
                  task: 'INITIATION_PHONE_CALL',
                  result: 'COMPLETED',
                },
                {
                  __typename: 'TaskResultPair',
                  task: 'INITIATION_EMAIL',
                  result: 'RECEIVED',
                },
                {
                  __typename: 'TaskResultPair',
                  task: 'INITIATION_TEXT_MESSAGE',
                  result: 'RECEIVED',
                },
                {
                  __typename: 'TaskResultPair',
                  task: 'INITIATION_SOCIAL_MEDIA',
                  result: 'RECEIVED',
                },
                {
                  __typename: 'TaskResultPair',
                  task: 'INITIATION_LETTER',
                  result: 'RECEIVED',
                },
                {
                  __typename: 'TaskResultPair',
                  task: 'INITIATION_SPECIAL_GIFT_APPEAL',
                  result: 'RECEIVED',
                },
                {
                  __typename: 'TaskResultPair',
                  task: 'INITIATION_IN_PERSON',
                  result: 'COMPLETED',
                },
              ],
              name: 'INITIATION_RESULT_NOT_INTERESTED',
              suggestedContactStatus: 'NOT_INTERESTED',
              suggestedNextActions: null,
            },
          ],
          tags: null,
        },
        contactStatuses: ['CONTACT_FOR_APPOINTMENT'],
        tasks: [
          'INITIATION_PHONE_CALL',
          'INITIATION_EMAIL',
          'INITIATION_TEXT_MESSAGE',
          'INITIATION_SOCIAL_MEDIA',
          'INITIATION_LETTER',
          'INITIATION_SPECIAL_GIFT_APPEAL',
          'INITIATION_IN_PERSON',
        ],
      },
      {
        __typename: 'Phase',
        id: 'APPOINTMENT',
        name: 'Appointment',
        results: {
          __typename: 'Result',
          resultOptions: [
            {
              __typename: 'ResultOption',
              dbResult: [
                {
                  __typename: 'TaskResultPair',
                  task: 'APPOINTMENT_IN_PERSON',
                  result: 'ATTEMPTED',
                },
                {
                  __typename: 'TaskResultPair',
                  task: 'APPOINTMENT_VIDEO_CALL',
                  result: 'ATTEMPTED',
                },
                {
                  __typename: 'TaskResultPair',
                  task: 'APPOINTMENT_PHONE_CALL',
                  result: 'ATTEMPTED',
                },
              ],
              name: 'APPOINTMENT_RESULT_CANCELLED',
              suggestedContactStatus: 'CONTACT_FOR_APPOINTMENT',
              suggestedNextActions: [
                'INITIATION_PHONE_CALL',
                'INITIATION_EMAIL',
                'INITIATION_TEXT_MESSAGE',
                'INITIATION_SOCIAL_MEDIA',
                'INITIATION_LETTER',
                'INITIATION_SPECIAL_GIFT_APPEAL',
                'INITIATION_IN_PERSON',
              ],
            },
            {
              __typename: 'ResultOption',
              dbResult: [
                {
                  __typename: 'TaskResultPair',
                  task: 'APPOINTMENT_IN_PERSON',
                  result: 'COMPLETED',
                },
                {
                  __typename: 'TaskResultPair',
                  task: 'APPOINTMENT_VIDEO_CALL',
                  result: 'COMPLETED',
                },
                {
                  __typename: 'TaskResultPair',
                  task: 'APPOINTMENT_PHONE_CALL',
                  result: 'COMPLETED',
                },
              ],
              name: 'APPOINTMENT_RESULT_FOLLOW_UP',
              suggestedContactStatus: 'CALL_FOR_DECISION',
              suggestedNextActions: [
                'FOLLOW_UP_PHONE_CALL',
                'FOLLOW_UP_EMAIL',
                'FOLLOW_UP_TEXT_MESSAGE',
                'FOLLOW_UP_SOCIAL_MEDIA',
                'FOLLOW_UP_IN_PERSON',
              ],
            },
            {
              __typename: 'ResultOption',
              dbResult: [
                {
                  __typename: 'TaskResultPair',
                  task: 'APPOINTMENT_IN_PERSON',
                  result: 'COMPLETED',
                },
                {
                  __typename: 'TaskResultPair',
                  task: 'APPOINTMENT_VIDEO_CALL',
                  result: 'COMPLETED',
                },
                {
                  __typename: 'TaskResultPair',
                  task: 'APPOINTMENT_PHONE_CALL',
                  result: 'COMPLETED',
                },
              ],
              name: 'FOLLOW_UP_RESULT_PARTNER_FINANCIAL',
              suggestedContactStatus: 'PARTNER_FINANCIAL',
              suggestedNextActions: ['PARTNER_CARE_THANK'],
            },
            {
              __typename: 'ResultOption',
              dbResult: [
                {
                  __typename: 'TaskResultPair',
                  task: 'APPOINTMENT_IN_PERSON',
                  result: 'COMPLETED',
                },
                {
                  __typename: 'TaskResultPair',
                  task: 'APPOINTMENT_VIDEO_CALL',
                  result: 'COMPLETED',
                },
                {
                  __typename: 'TaskResultPair',
                  task: 'APPOINTMENT_PHONE_CALL',
                  result: 'COMPLETED',
                },
              ],
              name: 'FOLLOW_UP_RESULT_PARTNER_SPECIAL',
              suggestedContactStatus: 'PARTNER_SPECIAL',
              suggestedNextActions: ['PARTNER_CARE_THANK'],
            },
            {
              __typename: 'ResultOption',
              dbResult: [
                {
                  __typename: 'TaskResultPair',
                  task: 'APPOINTMENT_IN_PERSON',
                  result: 'COMPLETED',
                },
                {
                  __typename: 'TaskResultPair',
                  task: 'APPOINTMENT_VIDEO_CALL',
                  result: 'COMPLETED',
                },
                {
                  __typename: 'TaskResultPair',
                  task: 'APPOINTMENT_PHONE_CALL',
                  result: 'COMPLETED',
                },
              ],
              name: 'FOLLOW_UP_RESULT_PARTNER_PRAY',
              suggestedContactStatus: 'PARTNER_PRAY',
              suggestedNextActions: ['PARTNER_CARE_THANK'],
            },
            {
              __typename: 'ResultOption',
              dbResult: [
                {
                  __typename: 'TaskResultPair',
                  task: 'APPOINTMENT_IN_PERSON',
                  result: 'COMPLETED',
                },
                {
                  __typename: 'TaskResultPair',
                  task: 'APPOINTMENT_VIDEO_CALL',
                  result: 'COMPLETED',
                },
                {
                  __typename: 'TaskResultPair',
                  task: 'APPOINTMENT_PHONE_CALL',
                  result: 'COMPLETED',
                },
              ],
              name: 'FOLLOW_UP_RESULT_NOT_INTERESTED',
              suggestedContactStatus: 'NOT_INTERESTED',
              suggestedNextActions: null,
            },
          ],
          tags: [
            {
              __typename: 'IdValue',
              value: 'asked for support',
              id: 'asked for support',
            },
            {
              __typename: 'IdValue',
              value: 'asked for connections',
              id: 'asked for connections',
            },
            {
              __typename: 'IdValue',
              value: 'asked for advocacy',
              id: 'asked for advocacy',
            },
            {
              __typename: 'IdValue',
              value: 'asked for increase',
              id: 'asked for increase',
            },
          ],
        },
        contactStatuses: ['APPOINTMENT_SCHEDULED'],
        tasks: [
          'APPOINTMENT_IN_PERSON',
          'APPOINTMENT_PHONE_CALL',
          'APPOINTMENT_VIDEO_CALL',
        ],
      },
      {
        __typename: 'Phase',
        id: 'FOLLOW_UP',
        name: 'Follow Up',
        results: {
          __typename: 'Result',
          resultOptions: [
            {
              __typename: 'ResultOption',
              dbResult: [
                {
                  __typename: 'TaskResultPair',
                  task: 'FOLLOW_UP_PHONE_CALL',
                  result: 'ATTEMPTED',
                },
                {
                  __typename: 'TaskResultPair',
                  task: 'FOLLOW_UP_EMAIL',
                  result: 'COMPLETED',
                },
                {
                  __typename: 'TaskResultPair',
                  task: 'FOLLOW_UP_TEXT_MESSAGE',
                  result: 'COMPLETED',
                },
                {
                  __typename: 'TaskResultPair',
                  task: 'FOLLOW_UP_SOCIAL_MEDIA',
                  result: 'COMPLETED',
                },
                {
                  __typename: 'TaskResultPair',
                  task: 'FOLLOW_UP_IN_PERSON',
                  result: 'COMPLETED',
                },
              ],
              name: 'INITIATION_RESULT_NO_RESPONSE',
              suggestedContactStatus: null,
              suggestedNextActions: [
                'FOLLOW_UP_PHONE_CALL',
                'FOLLOW_UP_EMAIL',
                'FOLLOW_UP_TEXT_MESSAGE',
                'FOLLOW_UP_SOCIAL_MEDIA',
                'FOLLOW_UP_IN_PERSON',
              ],
            },
            {
              __typename: 'ResultOption',
              dbResult: [
                {
                  __typename: 'TaskResultPair',
                  task: 'FOLLOW_UP_PHONE_CALL',
                  result: 'COMPLETED',
                },
                {
                  __typename: 'TaskResultPair',
                  task: 'FOLLOW_UP_EMAIL',
                  result: 'COMPLETED',
                },
                {
                  __typename: 'TaskResultPair',
                  task: 'FOLLOW_UP_TEXT_MESSAGE',
                  result: 'COMPLETED',
                },
                {
                  __typename: 'TaskResultPair',
                  task: 'FOLLOW_UP_SOCIAL_MEDIA',
                  result: 'COMPLETED',
                },
                {
                  __typename: 'TaskResultPair',
                  task: 'FOLLOW_UP_IN_PERSON',
                  result: 'COMPLETED',
                },
              ],
              name: 'FOLLOW_UP_RESULT_PARTNER_FINANCIAL',
              suggestedContactStatus: 'PARTNER_FINANCIAL',
              suggestedNextActions: ['PARTNER_CARE_THANK'],
            },
            {
              __typename: 'ResultOption',
              dbResult: [
                {
                  __typename: 'TaskResultPair',
                  task: 'FOLLOW_UP_PHONE_CALL',
                  result: 'COMPLETED',
                },
                {
                  __typename: 'TaskResultPair',
                  task: 'FOLLOW_UP_EMAIL',
                  result: 'COMPLETED',
                },
                {
                  __typename: 'TaskResultPair',
                  task: 'FOLLOW_UP_TEXT_MESSAGE',
                  result: 'COMPLETED',
                },
                {
                  __typename: 'TaskResultPair',
                  task: 'FOLLOW_UP_SOCIAL_MEDIA',
                  result: 'COMPLETED',
                },
                {
                  __typename: 'TaskResultPair',
                  task: 'FOLLOW_UP_IN_PERSON',
                  result: 'COMPLETED',
                },
              ],
              name: 'FOLLOW_UP_RESULT_PARTNER_SPECIAL',
              suggestedContactStatus: 'PARTNER_SPECIAL',
              suggestedNextActions: ['PARTNER_CARE_THANK'],
            },
            {
              __typename: 'ResultOption',
              dbResult: [
                {
                  __typename: 'TaskResultPair',
                  task: 'FOLLOW_UP_PHONE_CALL',
                  result: 'COMPLETED',
                },
                {
                  __typename: 'TaskResultPair',
                  task: 'FOLLOW_UP_EMAIL',
                  result: 'COMPLETED',
                },
                {
                  __typename: 'TaskResultPair',
                  task: 'FOLLOW_UP_TEXT_MESSAGE',
                  result: 'COMPLETED',
                },
                {
                  __typename: 'TaskResultPair',
                  task: 'FOLLOW_UP_SOCIAL_MEDIA',
                  result: 'COMPLETED',
                },
                {
                  __typename: 'TaskResultPair',
                  task: 'FOLLOW_UP_IN_PERSON',
                  result: 'COMPLETED',
                },
              ],
              name: 'FOLLOW_UP_RESULT_PARTNER_PRAY',
              suggestedContactStatus: 'PARTNER_PRAY',
              suggestedNextActions: ['PARTNER_CARE_THANK'],
            },
            {
              __typename: 'ResultOption',
              dbResult: [
                {
                  __typename: 'TaskResultPair',
                  task: 'FOLLOW_UP_PHONE_CALL',
                  result: 'COMPLETED',
                },
                {
                  __typename: 'TaskResultPair',
                  task: 'FOLLOW_UP_EMAIL',
                  result: 'COMPLETED',
                },
                {
                  __typename: 'TaskResultPair',
                  task: 'FOLLOW_UP_TEXT_MESSAGE',
                  result: 'COMPLETED',
                },
                {
                  __typename: 'TaskResultPair',
                  task: 'FOLLOW_UP_SOCIAL_MEDIA',
                  result: 'COMPLETED',
                },
                {
                  __typename: 'TaskResultPair',
                  task: 'FOLLOW_UP_IN_PERSON',
                  result: 'COMPLETED',
                },
              ],
              name: 'FOLLOW_UP_RESULT_NOT_INTERESTED',
              suggestedContactStatus: 'NOT_INTERESTED',
              suggestedNextActions: null,
            },
          ],
          tags: [
            {
              __typename: 'IdValue',
              value: 'Financial Support',
              id: 'Financial Support',
            },
            {
              __typename: 'IdValue',
              value: 'Gift not Started',
              id: 'Gift not Started',
            },
            {
              __typename: 'IdValue',
              value: 'Special Gift',
              id: 'Special Gift',
            },
            {
              __typename: 'IdValue',
              value: 'Connections',
              id: 'Connections',
            },
            {
              __typename: 'IdValue',
              value: 'Increase',
              id: 'Increase',
            },
          ],
        },
        contactStatuses: ['CALL_FOR_DECISION'],
        tasks: [
          'FOLLOW_UP_PHONE_CALL',
          'FOLLOW_UP_EMAIL',
          'FOLLOW_UP_TEXT_MESSAGE',
          'FOLLOW_UP_SOCIAL_MEDIA',
          'FOLLOW_UP_IN_PERSON',
        ],
      },
      {
        __typename: 'Phase',
        id: 'PARTNER_CARE',
        name: 'Partner Care',
        results: {
          __typename: 'Result',
          resultOptions: [],
          tags: null,
        },
        contactStatuses: [
          'PARTNER_FINANCIAL',
          'PARTNER_SPECIAL',
          'PARTNER_PRAY',
        ],
        tasks: [
          'PARTNER_CARE_PHONE_CALL',
          'PARTNER_CARE_EMAIL',
          'PARTNER_CARE_TEXT_MESSAGE',
          'PARTNER_CARE_SOCIAL_MEDIA',
          'PARTNER_CARE_IN_PERSON',
          'PARTNER_CARE_THANK',
          'PARTNER_CARE_DIGITAL_NEWSLETTER',
          'PARTNER_CARE_PHYSICAL_NEWSLETTER',
          'PARTNER_CARE_PRAYER_REQUEST',
          'PARTNER_CARE_UPDATE_INFORMATION',
          'PARTNER_CARE_TO_DO',
        ],
      },
      {
        __typename: 'Phase',
        id: 'ARCHIVE',
        name: 'Archive',
        results: {
          __typename: 'Result',
          resultOptions: [],
          tags: null,
        },
        contactStatuses: [
          'NOT_INTERESTED',
          'UNRESPONSIVE',
          'NEVER_ASK',
          'RESEARCH_ABANDONED',
          'EXPIRED_REFERRAL',
        ],
        tasks: [],
      },
    ],
  },
} as unknown as LoadConstantsQuery;

export default LoadConstantsMock;
