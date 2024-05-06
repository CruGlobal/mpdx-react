import {
  ActivityTypeEnum,
  DisplayResultEnum,
  Phase,
  StatusEnum,
  TaskResultPair,
} from 'src/graphql/types.generated';

type PossiblePartnerStatus = {
  suggestedContactStatus: StatusEnum;
  dbResult?: TaskResultPair;
};

export const possiblePartnerStatus = (
  phaseData: Phase | null,
  resultName: DisplayResultEnum | null,
  activityType?: ActivityTypeEnum | null,
): PossiblePartnerStatus | null => {
  if (!phaseData || !resultName || !activityType) return null;

  const contactStatus =
    phaseData.results?.resultOptions?.find(
      (result) => result.name === resultName,
    ) ?? null;

  const dbResult = contactStatus?.dbResult?.find(
    (result) => result.task?.toLowerCase() === activityType.toLowerCase(),
  );

  return {
    dbResult,
    suggestedContactStatus: contactStatus?.suggestedContactStatus as StatusEnum,
  };
};
