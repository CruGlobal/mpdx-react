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
    setFieldValue(
      'subject',
      activity?.name
        .split(' ')
        .map((word) => {
          return word[0].toUpperCase() + word.substring(1);
        })
        .join(' '),
    );
  }
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
    actionsWithoutNone.length === 1 ? actionsWithoutNone[0] : null,
  );
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

export const filterTags = (tagList, phaseTags) => {
  const additionalTags: string[] = [];
  const suggestedTags: string[] = [];
  tagList.forEach((tag) => {
    if (phaseTags.includes(tag)) {
      suggestedTags.push(tag);
    } else {
      additionalTags.push(tag);
    }
  });
  return { additionalTags, suggestedTags };
};
