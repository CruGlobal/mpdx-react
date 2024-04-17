import { ResultEnum, StatusEnum } from 'src/graphql/types.generated';
import { TaskPhase } from 'src/hooks/useContactPhaseData';

export const possiblePartnerStatus = (
  phaseData: TaskPhase | null,
  resultName: ResultEnum | null,
): StatusEnum | null => {
  if (!phaseData || !resultName) return null;

  const suggestedContactStatuses =
    phaseData?.results?.resultOptions?.find(
      (result) => result.name === resultName,
    ) || null;
  // TODO - Will need to replace StatusEnum
  return (
    (suggestedContactStatuses?.suggestedContactStatus as StatusEnum) || null
  );
};
