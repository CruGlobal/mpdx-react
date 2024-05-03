import {
  ActivityTypeEnum,
  DisplayResultEnum,
  Phase,
  PhaseEnum,
  ResultEnum,
} from 'src/graphql/types.generated';
import { Contstants, SetPhaseId } from 'src/hooks/useContactPhaseData';

type SetFieldValue = (
  field: string,
  value: any,
  shouldValidate?: boolean | undefined,
) => void;

type SetResultSelected = React.Dispatch<
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
  constants: Contstants;
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
  setFieldValue('nextAction', '');
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
