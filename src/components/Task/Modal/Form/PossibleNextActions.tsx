import {
  ActivityTypeEnum,
  DisplayResultEnum,
  Phase,
} from 'src/graphql/types.generated';

// TODO need to add 'Update Information' & Video Call as type
// Update Information
// Video Call

export const possibleNextActions = (
  phaseData: Phase | null,
  resultName: DisplayResultEnum | null,
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

  return result?.suggestedNextActions
    ? [ActivityTypeEnum.None, ...result.suggestedNextActions]
    : [];
};
