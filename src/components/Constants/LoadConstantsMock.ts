import { MockedResponse } from '@apollo/client/testing';
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
        id: 'INITIATION_PHONE_CALL',
        name: 'Phone call to initiate appointment',
        value: 'Initiation - Phone Call',
      },
      {
        id: 'INITIATION_EMAIL',
        name: 'Email to initiate',
        value: 'Initiation - Email',
      },
      {
        id: 'INITIATION_TEXT_MESSAGE',
        name: 'Text message to initiate',
        value: 'Initiation - Text Message',
      },
      {
        id: 'INITIATION_SOCIAL_MEDIA',
        name: 'Social media message to initiate',
        value: 'Initiation - Social Media',
      },
      {
        id: 'INITIATION_LETTER',
        name: 'Letter to initiate',
        value: 'Initiation - Letter',
      },
      {
        id: 'INITIATION_SPECIAL_GIFT_APPEAL',
        name: 'Special gift appeal',
        value: 'Initiation - Special Gift Appeal',
      },
      {
        id: 'INITIATION_IN_PERSON',
        name: 'Initiate in person',
        value: 'Initiation - In Person',
      },
      {
        id: 'APPOINTMENT_IN_PERSON',
        name: 'In person appointment',
        value: 'Appointment - In Person',
      },
      {
        id: 'APPOINTMENT_PHONE_CALL',
        name: 'phone appointment',
        value: 'Appointment - Phone Call',
      },
      {
        id: 'APPOINTMENT_VIDEO_CALL',
        name: 'video appointment',
        value: 'Appointment - Video Call',
      },
      {
        id: 'FOLLOW_UP_PHONE_CALL',
        name: 'phone call to follow up',
        value: 'Follow Up - Phone Call',
      },
      {
        id: 'FOLLOW_UP_EMAIL',
        name: 'email to follow up',
        value: 'Follow Up - Email',
      },
      {
        id: 'FOLLOW_UP_TEXT_MESSAGE',
        name: 'text message to follow up',
        value: 'Follow Up - Text Message',
      },
      {
        id: 'FOLLOW_UP_SOCIAL_MEDIA',
        name: 'social media message to follow up',
        value: 'Follow Up - Social Media',
      },
      {
        id: 'FOLLOW_UP_IN_PERSON',
        name: 'follow up in person',
        value: 'Follow Up - In Person',
      },
      {
        id: 'PARTNER_CARE_PHONE_CALL',
        name: 'call partner for cultivation',
        value: 'Partner Care - Phone Call',
      },
      {
        id: 'PARTNER_CARE_EMAIL',
        name: 'email partner for cultivation',
        value: 'Partner Care - Email',
      },
      {
        id: 'PARTNER_CARE_TEXT_MESSAGE',
        name: 'text message partner for cultivation',
        value: 'Partner Care - Text Message',
      },
      {
        id: 'PARTNER_CARE_SOCIAL_MEDIA',
        name: 'social media message for cultivation',
        value: 'Partner Care - Social Media',
      },
      {
        id: 'PARTNER_CARE_IN_PERSON',
        name: 'connect in person for cultivation',
        value: 'Partner Care - In Person',
      },
      {
        id: 'PARTNER_CARE_THANK',
        name: 'send thank you note',
        value: 'Partner Care - Thank',
      },
      {
        id: 'PARTNER_CARE_DIGITAL_NEWSLETTER',
        name: 'send digital newsletter',
        value: 'Partner Care - Digital Newsletter',
      },
      {
        id: 'PARTNER_CARE_PHYSICAL_NEWSLETTER',
        name: 'send physical newsletter',
        value: 'Partner Care - Physical Newsletter',
      },
      {
        id: 'PARTNER_CARE_PRAYER_REQUEST',
        name: 'ask for or receive prayer request',
        value: 'Partner Care - Prayer Request',
      },
      {
        id: 'PARTNER_CARE_UPDATE_INFORMATION',
        name: 'update partner information',
        value: 'Partner Care - Update Information',
      },
      {
        id: 'PARTNER_CARE_TO_DO',
        name: '',
        value: 'Partner Care - To Do',
      },
    ],

    phases: [
      {
        contactStatuses: [
          'NEVER_CONTACTED',
          'ASK_IN_FUTURE',
          'RESEARCH_CONTACT_INFO',
          'CULTIVATE_RELATIONSHIP',
        ],
        id: 'CONNECTION',
        name: 'Connection',
        results: {
          resultOptions: [],
          tags: null,
        },
        tasks: [],
      },
      {
        contactStatuses: ['CONTACT_FOR_APPOINTMENT'],
        id: 'INITIATION',
        name: 'Initiation',
        results: {
          resultOptions: [
            {
              dbResult: [
                {
                  result: 'ATTEMPTED',
                  task: 'INITIATION_PHONE_CALL',
                },
                {
                  result: 'COMPLETED',
                  task: 'INITIATION_EMAIL',
                },
                {
                  result: 'COMPLETED',
                  task: 'INITIATION_TEXT_MESSAGE',
                },
                {
                  result: 'COMPLETED',
                  task: 'INITIATION_SOCIAL_MEDIA',
                },
                {
                  result: 'COMPLETED',
                  task: 'INITIATION_LETTER',
                },
                {
                  result: 'COMPLETED',
                  task: 'INITIATION_SPECIAL_GIFT_APPEAL',
                },
                {
                  result: 'COMPLETED',
                  task: 'INITIATION_IN_PERSON',
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
              dbResult: [
                {
                  result: 'COMPLETED',
                  task: 'INITIATION_PHONE_CALL',
                },
                {
                  result: 'RECEIVED',
                  task: 'INITIATION_EMAIL',
                },
                {
                  result: 'RECEIVED',
                  task: 'INITIATION_TEXT_MESSAGE',
                },
                {
                  result: 'RECEIVED',
                  task: 'INITIATION_SOCIAL_MEDIA',
                },
                {
                  result: 'RECEIVED',
                  task: 'INITIATION_LETTER',
                },
                {
                  result: 'RECEIVED',
                  task: 'INITIATION_SPECIAL_GIFT_APPEAL',
                },
                {
                  result: 'COMPLETED',
                  task: 'INITIATION_IN_PERSON',
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
              dbResult: [
                {
                  result: 'COMPLETED',
                  task: 'INITIATION_PHONE_CALL',
                },
                {
                  result: 'COMPLETED',
                  task: 'INITIATION_EMAIL',
                },
                {
                  result: 'COMPLETED',
                  task: 'INITIATION_TEXT_MESSAGE',
                },
                {
                  result: 'COMPLETED',
                  task: 'INITIATION_SOCIAL_MEDIA',
                },
                {
                  result: 'COMPLETED',
                  task: 'INITIATION_LETTER',
                },
                {
                  result: 'COMPLETED',
                  task: 'INITIATION_SPECIAL_GIFT_APPEAL',
                },
                {
                  result: 'COMPLETED',
                  task: 'INITIATION_IN_PERSON',
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
              dbResult: [
                {
                  result: 'COMPLETED',
                  task: 'INITIATION_PHONE_CALL',
                },
                {
                  result: 'RECEIVED',
                  task: 'INITIATION_EMAIL',
                },
                {
                  result: 'RECEIVED',
                  task: 'INITIATION_TEXT_MESSAGE',
                },
                {
                  result: 'RECEIVED',
                  task: 'INITIATION_SOCIAL_MEDIA',
                },
                {
                  result: 'RECEIVED',
                  task: 'INITIATION_LETTER',
                },
                {
                  result: 'RECEIVED',
                  task: 'INITIATION_SPECIAL_GIFT_APPEAL',
                },
                {
                  result: 'COMPLETED',
                  task: 'INITIATION_IN_PERSON',
                },
              ],
              name: 'INITIATION_RESULT_NOT_INTERESTED',
              suggestedContactStatus: 'NOT_INTERESTED',
              suggestedNextActions: null,
            },
          ],
          tags: null,
        },
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
        contactStatuses: ['APPOINTMENT_SCHEDULED'],
        id: 'APPOINTMENT',
        name: 'Appointment',
        results: {
          resultOptions: [
            {
              dbResult: [
                {
                  result: 'ATTEMPTED',
                  task: 'APPOINTMENT_IN_PERSON',
                },
                {
                  result: 'ATTEMPTED',
                  task: 'APPOINTMENT_VIDEO_CALL',
                },
                {
                  result: 'ATTEMPTED',
                  task: 'APPOINTMENT_PHONE_CALL',
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
              dbResult: [
                {
                  result: 'COMPLETED',
                  task: 'APPOINTMENT_IN_PERSON',
                },
                {
                  result: 'COMPLETED',
                  task: 'APPOINTMENT_VIDEO_CALL',
                },
                {
                  result: 'COMPLETED',
                  task: 'APPOINTMENT_PHONE_CALL',
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
              dbResult: [
                {
                  result: 'COMPLETED',
                  task: 'APPOINTMENT_IN_PERSON',
                },
                {
                  result: 'COMPLETED',
                  task: 'APPOINTMENT_VIDEO_CALL',
                },
                {
                  result: 'COMPLETED',
                  task: 'APPOINTMENT_PHONE_CALL',
                },
              ],
              name: 'FOLLOW_UP_RESULT_PARTNER_FINANCIAL',
              suggestedContactStatus: 'PARTNER_FINANCIAL',
              suggestedNextActions: ['PARTNER_CARE_THANK'],
            },
            {
              dbResult: [
                {
                  result: 'COMPLETED',
                  task: 'APPOINTMENT_IN_PERSON',
                },
                {
                  result: 'COMPLETED',
                  task: 'APPOINTMENT_VIDEO_CALL',
                },
                {
                  result: 'COMPLETED',
                  task: 'APPOINTMENT_PHONE_CALL',
                },
              ],
              name: 'FOLLOW_UP_RESULT_PARTNER_SPECIAL',
              suggestedContactStatus: 'PARTNER_SPECIAL',
              suggestedNextActions: ['PARTNER_CARE_THANK'],
            },
            {
              dbResult: [
                {
                  result: 'COMPLETED',
                  task: 'APPOINTMENT_IN_PERSON',
                },
                {
                  result: 'COMPLETED',
                  task: 'APPOINTMENT_VIDEO_CALL',
                },
                {
                  result: 'COMPLETED',
                  task: 'APPOINTMENT_PHONE_CALL',
                },
              ],
              name: 'FOLLOW_UP_RESULT_PARTNER_PRAY',
              suggestedContactStatus: 'PARTNER_PRAY',
              suggestedNextActions: ['PARTNER_CARE_THANK'],
            },
            {
              dbResult: [
                {
                  result: 'COMPLETED',
                  task: 'APPOINTMENT_IN_PERSON',
                },
                {
                  result: 'COMPLETED',
                  task: 'APPOINTMENT_VIDEO_CALL',
                },
                {
                  result: 'COMPLETED',
                  task: 'APPOINTMENT_PHONE_CALL',
                },
              ],
              name: 'FOLLOW_UP_RESULT_NOT_INTERESTED',
              suggestedContactStatus: 'NOT_INTERESTED',
              suggestedNextActions: null,
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
          'APPOINTMENT_IN_PERSON',
          'APPOINTMENT_PHONE_CALL',
          'APPOINTMENT_VIDEO_CALL',
        ],
      },
      {
        contactStatuses: ['CALL_FOR_DECISION'],
        id: 'FOLLOW_UP',
        name: 'Follow Up',
        results: {
          resultOptions: [
            {
              dbResult: [
                {
                  result: 'ATTEMPTED',
                  task: 'FOLLOW_UP_PHONE_CALL',
                },
                {
                  result: 'COMPLETED',
                  task: 'FOLLOW_UP_EMAIL',
                },
                {
                  result: 'COMPLETED',
                  task: 'FOLLOW_UP_TEXT_MESSAGE',
                },
                {
                  result: 'COMPLETED',
                  task: 'FOLLOW_UP_SOCIAL_MEDIA',
                },
                {
                  result: 'COMPLETED',
                  task: 'FOLLOW_UP_IN_PERSON',
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
              dbResult: [
                {
                  result: 'COMPLETED',
                  task: 'FOLLOW_UP_PHONE_CALL',
                },
                {
                  result: 'COMPLETED',
                  task: 'FOLLOW_UP_EMAIL',
                },
                {
                  result: 'COMPLETED',
                  task: 'FOLLOW_UP_TEXT_MESSAGE',
                },
                {
                  result: 'COMPLETED',
                  task: 'FOLLOW_UP_SOCIAL_MEDIA',
                },
                {
                  result: 'COMPLETED',
                  task: 'FOLLOW_UP_IN_PERSON',
                },
              ],
              name: 'FOLLOW_UP_RESULT_PARTNER_FINANCIAL',
              suggestedContactStatus: 'PARTNER_FINANCIAL',
              suggestedNextActions: ['PARTNER_CARE_THANK'],
            },
            {
              dbResult: [
                {
                  result: 'COMPLETED',
                  task: 'FOLLOW_UP_PHONE_CALL',
                },
                {
                  result: 'COMPLETED',
                  task: 'FOLLOW_UP_EMAIL',
                },
                {
                  result: 'COMPLETED',
                  task: 'FOLLOW_UP_TEXT_MESSAGE',
                },
                {
                  result: 'COMPLETED',
                  task: 'FOLLOW_UP_SOCIAL_MEDIA',
                },
                {
                  result: 'COMPLETED',
                  task: 'FOLLOW_UP_IN_PERSON',
                },
              ],
              name: 'FOLLOW_UP_RESULT_PARTNER_SPECIAL',
              suggestedContactStatus: 'PARTNER_SPECIAL',
              suggestedNextActions: ['PARTNER_CARE_THANK'],
            },
            {
              dbResult: [
                {
                  result: 'COMPLETED',
                  task: 'FOLLOW_UP_PHONE_CALL',
                },
                {
                  result: 'COMPLETED',
                  task: 'FOLLOW_UP_EMAIL',
                },
                {
                  result: 'COMPLETED',
                  task: 'FOLLOW_UP_TEXT_MESSAGE',
                },
                {
                  result: 'COMPLETED',
                  task: 'FOLLOW_UP_SOCIAL_MEDIA',
                },
                {
                  result: 'COMPLETED',
                  task: 'FOLLOW_UP_IN_PERSON',
                },
              ],
              name: 'FOLLOW_UP_RESULT_PARTNER_PRAY',
              suggestedContactStatus: 'PARTNER_PRAY',
              suggestedNextActions: ['PARTNER_CARE_THANK'],
            },
            {
              dbResult: [
                {
                  result: 'COMPLETED',
                  task: 'FOLLOW_UP_PHONE_CALL',
                },
                {
                  result: 'COMPLETED',
                  task: 'FOLLOW_UP_EMAIL',
                },
                {
                  result: 'COMPLETED',
                  task: 'FOLLOW_UP_TEXT_MESSAGE',
                },
                {
                  result: 'COMPLETED',
                  task: 'FOLLOW_UP_SOCIAL_MEDIA',
                },
                {
                  result: 'COMPLETED',
                  task: 'FOLLOW_UP_IN_PERSON',
                },
              ],
              name: 'FOLLOW_UP_RESULT_NOT_INTERESTED',
              suggestedContactStatus: 'NOT_INTERESTED',
              suggestedNextActions: null,
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
          'FOLLOW_UP_PHONE_CALL',
          'FOLLOW_UP_EMAIL',
          'FOLLOW_UP_TEXT_MESSAGE',
          'FOLLOW_UP_SOCIAL_MEDIA',
          'FOLLOW_UP_IN_PERSON',
        ],
      },
      {
        contactStatuses: [
          'PARTNER_FINANCIAL',
          'PARTNER_SPECIAL',
          'PARTNER_PRAY',
        ],
        id: 'PARTNER_CARE',
        name: 'Partner Care',
        results: {
          resultOptions: [
            {
              dbResult: [
                {
                  result: 'COMPLETED',
                  task: 'PARTNER_CARE_PHONE_CALL',
                },
                {
                  result: 'COMPLETED',
                  task: 'PARTNER_CARE_EMAIL',
                },
                {
                  result: 'COMPLETED',
                  task: 'PARTNER_CARE_TEXT_MESSAGE',
                },
                {
                  result: 'COMPLETED',
                  task: 'PARTNER_CARE_SOCIAL_MEDIA',
                },
                {
                  result: 'COMPLETED',
                  task: 'PARTNER_CARE_IN_PERSON',
                },
                {
                  result: 'COMPLETED',
                  task: 'PARTNER_CARE_THANK',
                },
                {
                  result: 'COMPLETED',
                  task: 'PARTNER_CARE_DIGITAL_NEWSLETTER',
                },
                {
                  result: 'COMPLETED',
                  task: 'PARTNER_CARE_PHYSICAL_NEWSLETTER',
                },
                {
                  result: 'COMPLETED',
                  task: 'PARTNER_CARE_PRAYER_REQUEST',
                },
                {
                  result: 'COMPLETED',
                  task: 'PARTNER_CARE_UPDATE_INFORMATION',
                },
                {
                  result: 'COMPLETED',
                  task: 'PARTNER_CARE_TO_DO',
                },
              ],
              name: 'PARTNER_CARE_COMPLETED',
              suggestedContactStatus: null,
              suggestedNextActions: [
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
          ],
          tags: null,
        },
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
        contactStatuses: [
          'NOT_INTERESTED',
          'UNRESPONSIVE',
          'NEVER_ASK',
          'RESEARCH_ABANDONED',
          'EXPIRED_REFERRAL',
        ],
        id: 'ARCHIVE',
        name: 'Archive',
        results: {
          resultOptions: [],
          tags: null,
        },
        tasks: [],
      },
    ],
  },
} as unknown as LoadConstantsQuery;

export default LoadConstantsMock;
