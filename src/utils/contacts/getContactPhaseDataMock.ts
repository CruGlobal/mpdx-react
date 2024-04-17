import { StatusEnum } from 'src/graphql/types.generated';
import { PhaseTypeEnum } from 'src/lib/MPDPhases';

export type ContactPhaseData = {
  phase: PhaseTypeEnum;
  name: string;
  tasks: string[];
  contactStatuses: string[];
  resultOptions: resultOptions;
};

export enum NewResultEnum {
  NoResponseYet = 'No Response Yet',
  DoesNotWantToMeet = 'Does not want to meet',
  CantMeetRightNowCircleBack = "Can't meet right now - circle back",
  AppointmentScheduled = 'Appointment Scheduled',
  CancelledNeedToReschedule = 'Cancelled-Need to reschedule',
  FollowUp = 'FollowUp',
  PartnerFinancial = 'Partner-Financial',
  PartnerSpecial = 'Partner-Special',
  PartnerPray = 'Partner-Pray',
  NotInterested = 'Not Interested',
}

type resultOptions = {
  tags?: string[];
  results?: resultOptionsResults[];
};

type resultOptionsResults = {
  name: NewResultEnum;
  value: string;
  suggestedContactStatus: StatusEnum | null;
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
          name: NewResultEnum.CancelledNeedToReschedule,
          value: 'cancelled',
          // TODO - tell Shelby to convert this into a string and not string[]
          suggestedContactStatus: StatusEnum.ContactForAppointment,
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
          name: NewResultEnum.CantMeetRightNowCircleBack,
          value: 'rescheduled',
          suggestedContactStatus: StatusEnum.AppointmentScheduled,
          suggestedActions: ['in_person', 'video_call', 'call'],
        },
        {
          name: NewResultEnum.FollowUp,
          value: 'follow_up',
          suggestedContactStatus: StatusEnum.CallForDecision,
          suggestedActions: [
            'call',
            'email',
            'text_message',
            'social_media',
            'in_person',
          ],
        },
        // TODO - I have changed this from what Shelby gave me. Partner info needs to be broken down like this.
        {
          name: NewResultEnum.PartnerFinancial,
          value: 'partnered',
          suggestedContactStatus: StatusEnum.PartnerFinancial,
          suggestedActions: ['partner_care'],
        },
        {
          name: NewResultEnum.PartnerSpecial,
          value: 'partnered',
          suggestedContactStatus: StatusEnum.PartnerSpecial,
          suggestedActions: ['partner_care'],
        },
        {
          name: NewResultEnum.PartnerPray,
          value: 'partnered',
          suggestedContactStatus: StatusEnum.PartnerPray,
          suggestedActions: ['partner_care'],
        },
        {
          name: NewResultEnum.NotInterested,
          value: 'not_interested',
          suggestedContactStatus: StatusEnum.NeverAsk,
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
      results: [
        {
          name: NewResultEnum.NoResponseYet,
          value: 'no_response_yet',
          suggestedContactStatus: null,
          suggestedActions: [
            'call',
            'email',
            'text_message',
            'social_media',
            'in_person',
          ],
        },
        {
          name: NewResultEnum.PartnerFinancial,
          value: 'PartnerFinancial',
          suggestedContactStatus: StatusEnum.PartnerFinancial,
          suggestedActions: ['in_person', 'video_call', 'call'],
        },
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
