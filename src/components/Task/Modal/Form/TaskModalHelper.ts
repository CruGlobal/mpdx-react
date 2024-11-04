import {
  ActivityTypeEnum,
  DisplayResultEnum,
  Phase,
  PhaseEnum,
  ResultEnum,
} from 'src/graphql/types.generated';
import { ActivityData, SetPhaseId } from 'src/hooks/usePhaseData';
import { possibleNextActions } from './possibleNextActions';

export type SetFieldValue = (
  field: string,
  value: any,
  shouldValidate?: boolean | undefined,
) => void;

export type SetFieldTouched = (
  field: string,
  value: any,
  shouldValidate?: boolean | undefined,
) => void;

export type SetResultSelected = React.Dispatch<
  React.SetStateAction<DisplayResultEnum | ResultEnum | null>
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
  activities: ActivityTypeEnum[];
  focusActivity: () => void;
  activityType: ActivityTypeEnum | undefined;
  activityTypes: Map<ActivityTypeEnum, ActivityData>;
  setFieldTouched: SetFieldTouched;
};

export type HandleTaskActionChangeProps = {
  activityType: ActivityTypeEnum | null;
  setFieldValue: SetFieldValue;
  setActionSelected: SetActionSelected;
  activityTypes: Map<ActivityTypeEnum, ActivityData>;
  setFieldTouched: SetFieldTouched;
};

export type HandleResultChangeProps = {
  result: string | null;
  setFieldValue: SetFieldValue;
  setResultSelected: SetResultSelected;
  phaseData: Phase | null;
  completedAction: ActivityTypeEnum | null | undefined;
};

export const handleTaskPhaseChange = ({
  phase,
  setFieldValue,
  setResultSelected,
  setActionSelected,
  setPhaseId,
  setSelectedSuggestedTags,
  activities,
  focusActivity,
  activityType,
  activityTypes,
  setFieldTouched,
}: HandleTaskPhaseChangeProps): void => {
  setFieldValue('taskPhase', phase);
  const activitySelection = activities.find((activity) =>
    activityType?.includes(activity.replace(phase + '_', '')),
  ) as ActivityTypeEnum;
  setFieldValue('activityType', activitySelection || '');
  setFieldValue('subject', '');
  setFieldValue('displayResult', null);
  setFieldValue('result', null);
  setFieldValue('nextAction', null);
  setResultSelected(null);
  setActionSelected(null);
  setPhaseId(phase);
  setSelectedSuggestedTags([]);
  setTaskName(activityTypes, activitySelection, setFieldValue, setFieldTouched);
  if (!activitySelection) {
    focusActivity();
  }
};

export const handleTaskActionChange = ({
  activityType,
  setFieldValue,
  setActionSelected,
  activityTypes,
  setFieldTouched,
}: HandleTaskActionChangeProps): void => {
  setFieldValue('activityType', activityType);
  setActionSelected(activityType || null);
  setTaskName(activityTypes, activityType, setFieldValue, setFieldTouched);
};

export const handleResultChange = ({
  result,
  setFieldValue,
  setResultSelected,
  phaseData,
  completedAction,
}: HandleResultChangeProps): void => {
  setFieldValue('displayResult', result);
  setFieldValue('result', result);
  setFieldValue('changeContactStatus', false);
  setResultSelected(result as DisplayResultEnum);
  const nextActions = possibleNextActions(
    phaseData,
    result as DisplayResultEnum,
    ActivityTypeEnum.None,
  );
  const defaultNextAction = findNextAction(completedAction, nextActions);
  setFieldValue('nextAction', defaultNextAction);
};

const findNextAction = (
  completedAction: ActivityTypeEnum | null | undefined,
  nextActions: ActivityTypeEnum[],
): string | null => {
  const actionsWithoutNone = nextActions.filter(
    (action) => action !== ActivityTypeEnum.None,
  );
  if (completedAction && nextActions.includes(completedAction)) {
    return completedAction;
  } else if (actionsWithoutNone.length === 1) {
    return actionsWithoutNone[0];
  } else {
    return null;
  }
};

export const getDatabaseValueFromResult = (
  phaseData: Phase | null,
  displayResult?: DisplayResultEnum | ResultEnum,
  activityType?: ActivityTypeEnum | null,
): ResultEnum => {
  if (!displayResult || !phaseData || !activityType) {
    switch (displayResult) {
      case ResultEnum.Attempted:
        return ResultEnum.Attempted;
      case ResultEnum.AttemptedLeftMessage:
        return ResultEnum.AttemptedLeftMessage;
      case ResultEnum.Completed:
        return ResultEnum.Completed;
      case ResultEnum.Done:
        return ResultEnum.Done;
      case ResultEnum.Received:
        return ResultEnum.Received;
      default:
        return ResultEnum.None;
    }
  }
  const resultOption = phaseData?.results?.resultOptions?.find(
    (result) => result.name === displayResult,
  );

  const dbResult = resultOption?.dbResult?.find(
    (item) => item.task === activityType,
  );
  return dbResult?.result || ResultEnum.None;
};

export interface ExtractSuggestedTags {
  additionalTags: string[];
  suggestedTags: string[];
}

// splits a list of tags into regular tags and suggested tags.
export const extractSuggestedTags = (
  tagList: string[],
  phaseTags: string[],
): ExtractSuggestedTags => {
  const additionalTags: string[] = [];
  const suggestedTags: string[] = [];
  tagList.forEach((tag) => {
    if (phaseTags.map((tag) => tag.toLowerCase()).includes(tag)) {
      suggestedTags.push(tag);
    } else {
      additionalTags.push(tag);
    }
  });
  return { additionalTags, suggestedTags };
};

export const getDefaultTaskName = (
  activityType: ActivityTypeEnum | null,
  activityTypes: Map<ActivityTypeEnum, ActivityData>,
): string => {
  const activity = activityType && activityTypes.get(activityType);
  return activity?.subject ?? '';
};

const setTaskName = (
  activityTypes: Map<ActivityTypeEnum, ActivityData>,
  activityType: ActivityTypeEnum | null,
  setFieldValue: SetFieldValue,
  setFieldTouched: SetFieldTouched,
) => {
  const defaultTaskName = getDefaultTaskName(activityType, activityTypes);
  if (defaultTaskName) {
    setFieldValue('subject', defaultTaskName);
  }
  setTimeout(() => setFieldTouched('activityType', true));
};
