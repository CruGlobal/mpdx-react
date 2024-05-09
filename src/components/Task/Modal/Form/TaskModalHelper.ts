import {
  ActivityTypeEnum,
  DisplayResultEnum,
  Phase,
  PhaseEnum,
  ResultEnum,
} from 'src/graphql/types.generated';
import { Constants, SetPhaseId } from 'src/hooks/usePhaseData';

export type SetFieldValue = (
  field: string,
  value: any,
  shouldValidate?: boolean | undefined,
) => void;

export type SetResultSelected = React.Dispatch<
  React.SetStateAction<DisplayResultEnum | null>
>;

type SetActionSelected = React.Dispatch<
  React.SetStateAction<ActivityTypeEnum | null>
>;

export type HandleTaskPhaseChangeProps = {
  phase: PhaseEnum | null;
  setFieldValue: SetFieldValue;
  setResultSelected: SetResultSelected;
  setActionSelected: SetActionSelected;
  setPhaseId: SetPhaseId;
  setSelectedSuggestedTags: React.Dispatch<React.SetStateAction<string[]>>;
};

export type HandleTaskActionChangeProps = {
  activityType: ActivityTypeEnum | null;
  setFieldValue: SetFieldValue;
  setActionSelected: SetActionSelected;
  constants: Constants;
};

export type HandleResultChangeProps = {
  result: string | null;
  setFieldValue: SetFieldValue;
  setResultSelected: SetResultSelected;
};

export const handleTaskPhaseChange = ({
  phase,
  setFieldValue,
  setResultSelected,
  setActionSelected,
  setPhaseId,
  setSelectedSuggestedTags,
}: HandleTaskPhaseChangeProps): void => {
  setFieldValue('taskPhase', phase);
  setFieldValue('activityType', '');
  setFieldValue('subject', '');
  setFieldValue('result', undefined);
  setResultSelected(null);
  setActionSelected(null);
  setPhaseId(phase);
  setSelectedSuggestedTags([]);
};

export const handleTaskActionChange = ({
  activityType,
  setFieldValue,
  setActionSelected,
  constants,
}: HandleTaskActionChangeProps): void => {
  setFieldValue('activityType', activityType);
  setActionSelected(activityType);
  const activity = constants?.activities?.find(
    (activity) => activity.id === activityType,
  );
  if (activity) {
    setFieldValue('subject', activity.value);
  }
};

export const handleResultChange = ({
  result,
  setFieldValue,
  setResultSelected,
}: HandleResultChangeProps): void => {
  setFieldValue('result', result);
  setFieldValue('nextAction', ActivityTypeEnum.None);
  setFieldValue('changeContactStatus', false);
  setResultSelected(result as DisplayResultEnum);
};

export const getDatabaseValueFromResult = (
  phaseData: Phase | null,
  displayResult?: DisplayResultEnum | ResultEnum,
  activityType?: ActivityTypeEnum | null,
): ResultEnum => {
  if (!displayResult || !phaseData || !activityType) {
    return ResultEnum.None;
  }
  const resultOption = phaseData?.results?.resultOptions?.find(
    (result) => result.name === displayResult,
  );

  const dbResult = resultOption?.dbResult?.find(
    (item) => item.task === activityType,
  );
  return dbResult?.result || ResultEnum.None;
};

export const phasesMock = {
  LoadConstants: {
    constant: {
      phases: [
        {
          name: 'Connection',
          id: 'CONNECTION',
          tasks: [],
          results: {
            tags: null,
            resultOptions: [],
          },
          contactStatuses: [
            'NEVER_CONTACTED',
            'ASK_IN_FUTURE',
            'RESEARCH_CONTACT_INFO',
            'CULTIVATE_RELATIONSHIP',
          ],
        },
        {
          name: 'Initiation',
          id: 'INITIATION',
          tasks: [
            'INITIATION_PHONE_CALL',
            'INITIATION_EMAIL',
            'INITIATION_TEXT_MESSAGE',
            'INITIATION_SOCIAL_MEDIA',
            'INITIATION_LETTER',
            'INITIATION_SPECIAL_GIFT_APPEAL',
            'INITIATION_IN_PERSON',
          ],
          results: {
            tags: null,
            resultOptions: [
              {
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
              },
              {
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
              },
              {
                name: 'INITIATION_RESULT_APPOINTMENT_SCHEDULED',
                suggestedContactStatus: 'APPOINTMENT_SCHEDULED',
                suggestedNextActions: [
                  'APPOINTMENT_IN_PERSON',
                  'APPOINTMENT_PHONE_CALL',
                  'APPOINTMENT_VIDEO_CALL',
                ],
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
              },
              {
                name: 'INITIATION_RESULT_NOT_INTERESTED',
                suggestedContactStatus: 'NOT_INTERESTED',
                suggestedNextActions: null,
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
              },
            ],
          },
          contactStatuses: ['CONTACT_FOR_APPOINTMENT'],
        },
        {
          name: 'Treffen',
          id: 'APPOINTMENT',
          tasks: [
            'APPOINTMENT_IN_PERSON',
            'APPOINTMENT_PHONE_CALL',
            'APPOINTMENT_VIDEO_CALL',
          ],
          results: {
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
            resultOptions: [
              {
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
              },
              {
                name: 'APPOINTMENT_RESULT_FOLLOW_UP',
                suggestedContactStatus: 'CALL_FOR_DECISION',
                suggestedNextActions: [
                  'FOLLOW_UP_PHONE_CALL',
                  'FOLLOW_UP_EMAIL',
                  'FOLLOW_UP_TEXT_MESSAGE',
                  'FOLLOW_UP_SOCIAL_MEDIA',
                  'FOLLOW_UP_IN_PERSON',
                ],
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
              },
              {
                name: 'FOLLOW_UP_RESULT_PARTNER_FINANCIAL',
                suggestedContactStatus: 'PARTNER_FINANCIAL',
                suggestedNextActions: ['PARTNER_CARE_THANK'],
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
              },
              {
                name: 'FOLLOW_UP_RESULT_PARTNER_SPECIAL',
                suggestedContactStatus: 'PARTNER_SPECIAL',
                suggestedNextActions: ['PARTNER_CARE_THANK'],
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
              },
              {
                name: 'FOLLOW_UP_RESULT_PARTNER_PRAY',
                suggestedContactStatus: 'PARTNER_PRAY',
                suggestedNextActions: ['PARTNER_CARE_THANK'],
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
              },
              {
                name: 'FOLLOW_UP_RESULT_NOT_INTERESTED',
                suggestedContactStatus: 'NOT_INTERESTED',
                suggestedNextActions: null,
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
              },
            ],
          },
          contactStatuses: ['APPOINTMENT_SCHEDULED'],
        },
        {
          name: 'Follow Up',
          id: 'FOLLOW_UP',
          tasks: [
            'FOLLOW_UP_PHONE_CALL',
            'FOLLOW_UP_EMAIL',
            'FOLLOW_UP_TEXT_MESSAGE',
            'FOLLOW_UP_SOCIAL_MEDIA',
            'FOLLOW_UP_IN_PERSON',
          ],
          results: {
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
            resultOptions: [
              {
                name: 'INITIATION_RESULT_NO_RESPONSE',
                suggestedContactStatus: null,
                suggestedNextActions: [
                  'FOLLOW_UP_PHONE_CALL',
                  'FOLLOW_UP_EMAIL',
                  'FOLLOW_UP_TEXT_MESSAGE',
                  'FOLLOW_UP_SOCIAL_MEDIA',
                  'FOLLOW_UP_IN_PERSON',
                ],
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
              },
              {
                name: 'FOLLOW_UP_RESULT_PARTNER_FINANCIAL',
                suggestedContactStatus: 'PARTNER_FINANCIAL',
                suggestedNextActions: ['PARTNER_CARE_THANK'],
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
              },
              {
                name: 'FOLLOW_UP_RESULT_PARTNER_SPECIAL',
                suggestedContactStatus: 'PARTNER_SPECIAL',
                suggestedNextActions: ['PARTNER_CARE_THANK'],
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
              },
              {
                name: 'FOLLOW_UP_RESULT_PARTNER_PRAY',
                suggestedContactStatus: 'PARTNER_PRAY',
                suggestedNextActions: ['PARTNER_CARE_THANK'],
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
              },
              {
                name: 'FOLLOW_UP_RESULT_NOT_INTERESTED',
                suggestedContactStatus: 'NOT_INTERESTED',
                suggestedNextActions: null,
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
              },
            ],
          },
          contactStatuses: ['CALL_FOR_DECISION'],
        },
        {
          name: 'Partner Care',
          id: 'PARTNER_CARE',
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
          results: {
            tags: null,
            resultOptions: [],
          },
          contactStatuses: [
            'PARTNER_FINANCIAL',
            'PARTNER_SPECIAL',
            'PARTNER_PRAY',
          ],
        },
        {
          name: 'Archive',
          id: 'ARCHIVE',
          tasks: [],
          results: {
            tags: null,
            resultOptions: [],
          },
          contactStatuses: [
            'NOT_INTERESTED',
            'UNRESPONSIVE',
            'NEVER_ASK',
            'RESEARCH_ABANDONED',
            'EXPIRED_REFERRAL',
          ],
        },
      ],
    },
  },
};
