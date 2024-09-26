import {
  ActivityTypeEnum,
  DisplayResultEnum,
  Phase,
  PhaseEnum,
  ResultEnum,
} from 'src/graphql/types.generated';
import { Constants, SetPhaseId } from 'src/hooks/usePhaseData';
import { possibleNextActions } from './PossibleNextActions';

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
  React.SetStateAction<ActivityTypeEnum | undefined>
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
  activityType: ActivityTypeEnum | undefined;
  setFieldValue: SetFieldValue;
  setActionSelected: SetActionSelected;
  constants: Constants;
  setFieldTouched: SetFieldTouched;
};

export type HandleResultChangeProps = {
  result: string | null;
  setFieldValue: SetFieldValue;
  setResultSelected: SetResultSelected;
  phaseData: Phase | null;
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
  setFieldValue('displayResult', undefined);
  setFieldValue('result', undefined);
  setFieldValue('nextAction', undefined);
  setResultSelected(null);
  setActionSelected(undefined);
  setPhaseId(phase);
  setSelectedSuggestedTags([]);
};

export const handleTaskActionChange = ({
  activityType,
  setFieldValue,
  setActionSelected,
  constants,
  setFieldTouched,
}: HandleTaskActionChangeProps): void => {
  setFieldValue('activityType', activityType);
  setActionSelected(activityType || undefined);
  const activity = constants?.activities?.find(
    (activity) => activity.id === activityType,
  );
  if (activity) {
    setFieldValue(
      'subject',
      activity?.name
        ? activity.name
            .split(' ')
            .map((word) => {
              return word[0].toUpperCase() + word.substring(1);
            })
            .join(' ')
        : '',
    );
  }
  setTimeout(() => setFieldTouched('activityType', true));
};

export const handleResultChange = ({
  result,
  setFieldValue,
  setResultSelected,
  phaseData,
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
  const actionsWithoutNone = nextActions.filter(
    (action) => action !== ActivityTypeEnum.None,
  );
  setFieldValue(
    'nextAction',
    actionsWithoutNone.length === 1 ? actionsWithoutNone[0] : undefined,
  );
};

export const getDatabaseValueFromResult = (
  phaseData: Phase | null,
  displayResult?: DisplayResultEnum | ResultEnum,
  activityType?: ActivityTypeEnum | undefined,
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

// splits a list of tags into regular tags and suggested tags.
export const extractSuggestedTags = (
  tagList: string[],
  phaseTags: string[],
) => {
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
