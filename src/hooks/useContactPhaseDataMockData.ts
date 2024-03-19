import { PhaseTypeEnum } from 'src/lib/MPDPhases';

export type ContactPhaseData = {
  phase: PhaseTypeEnum;
  name: string;
  tasks: string[];
  contactStatuses: string[];
  resultOptions: resultOptions;
  suggestedContactStatus?: string[];
};

type resultOptions = {
  tags?: string[];
  results?: resultOptionsResults[];
};

type resultOptionsResults = {
  name: string;
  value: string;
  suggestedContactStatus: string[];
  suggestedActions: string[];
};

export const allPhaseData: ContactPhaseData[] = [
  {
    phase: PhaseTypeEnum.connection,
    name: 'Connections',
    tasks: [],
    contactStatuses: [
      'never_contacted',
      'ask_in_future',
      'cultivate_relationship',
    ],
    resultOptions: {},
  },
  {
    phase: PhaseTypeEnum.initiation,
    name: 'Initiation',
    tasks: [
      'phone_call',
      'email',
      'text',
      'social_media',
      'letter',
      'appeal',
      'in_person',
    ],
    contactStatuses: ['contact_for_appointment'],
    resultOptions: {},
  },
  {
    phase: PhaseTypeEnum.appointment,
    name: 'Appointment',
    tasks: ['in_person', 'video_call', 'call'],
    contactStatuses: ['appoint_scheduled'],
    resultOptions: {
      tags: [
        'asked for support',
        'asked for connections',
        'asked for advocacy',
        'asked for increase',
      ],
      results: [
        {
          name: 'Cancelled',
          value: 'cancelled',
          suggestedContactStatus: ['contact_for_appointment'],
          suggestedActions: [
            'phone_call',
            'email',
            'text',
            'social_media',
            'letter',
            'appeal',
            'in_person',
          ],
        },
        {
          name: 'Rescheduled',
          value: 'rescheduled',
          suggestedContactStatus: ['appoint_scheduled'],
          suggestedActions: ['in_person', 'video_call', 'call'],
        },
        {
          name: 'Follow Up',
          value: 'follow_up',
          suggestedContactStatus: ['call_for_decision'],
          suggestedActions: [
            'call',
            'email',
            'text_message',
            'social_media',
            'in_person',
          ],
        },
        {
          name: 'Partnered Up',
          value: 'partnered',
          suggestedContactStatus: [
            'Partner - Financial',
            'Partner - Special',
            'Partner - Prayer',
          ],
          suggestedActions: ['partner_care'],
        },
        {
          name: 'Not Interested',
          value: 'not_interested',
          suggestedContactStatus: ['archive'],
          suggestedActions: [],
        },
      ],
    },
  },
  {
    phase: PhaseTypeEnum.follow_up,
    name: 'Follow Up',
    tasks: ['call', 'email', 'text_message', 'social_media', 'in_person'],
    contactStatuses: ['call_for_decision'],
    resultOptions: {
      tags: [
        'For Financial Support',
        'For Gift not Started',
        'For Special Gift',
        'For Connections',
        'For Increase',
      ],
    },
  },
  {
    phase: PhaseTypeEnum.partner_care,
    name: 'Partner Care',
    tasks: ['partner_care'],
    contactStatuses: [
      'Partner - Financial',
      'Partner - Special',
      'Partner - Prayer',
    ],
    resultOptions: {},
  },
  {
    phase: PhaseTypeEnum.archive,
    name: 'Archive',
    tasks: [],
    contactStatuses: ['archive'],
    resultOptions: {},
  },
];
