import {
  ActivityTypeEnum,
  DisplayResultEnum,
  Phase,
  ResultEnum,
  StatusEnum,
  TaskResultPair,
} from 'src/graphql/types.generated';

export type PossiblePartnerStatus = {
  suggestedContactStatus: StatusEnum;
  dbResult?: TaskResultPair;
};

export const possiblePartnerStatus = (
  phaseData: Phase | null,
  resultName: DisplayResultEnum | ResultEnum | null,
  activityType?: ActivityTypeEnum | undefined,
): PossiblePartnerStatus | null => {
  if (!phaseData || !resultName || !activityType) {
    return null;
  }

  const contactStatus =
    phaseData.results?.resultOptions?.find(
      (result) => result.name === resultName,
    ) ?? null;

  const dbResult = contactStatus?.dbResult?.find(
    (result) => result.task?.toLowerCase() === activityType.toLowerCase(),
  );

  return {
    dbResult,
    suggestedContactStatus:
      (contactStatus?.suggestedContactStatus as StatusEnum) || null,
  };
};
