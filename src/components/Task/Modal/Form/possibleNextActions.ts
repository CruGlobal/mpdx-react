import {
  ActivityTypeEnum,
  DisplayResultEnum,
  Phase,
  ResultEnum,
} from 'src/graphql/types.generated';

export const possibleNextActions = (
  phaseData: Phase | null,
  resultName: DisplayResultEnum | ResultEnum | null,
  activity?: ActivityTypeEnum | undefined,
): ActivityTypeEnum[] => {
  if (!phaseData || !resultName || !activity) {
    return [];
  }

  const result = phaseData.results?.resultOptions
    ? phaseData.results.resultOptions.find(
        (result) => result.name?.toLowerCase() === resultName.toLowerCase(),
      )
    : null;

  return result?.suggestedNextActions?.length
    ? [ActivityTypeEnum.None, ...result.suggestedNextActions]
    : [];
};
