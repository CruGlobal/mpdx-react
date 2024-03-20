import { StatusEnum } from 'src/graphql/types.generated';
import {
  ContactPhaseData,
  NewResultEnum,
} from 'src/hooks/useContactPhaseDataMockData';

export const possiblePartnerStatus = (
  phaseData: ContactPhaseData | null,
  resultName: NewResultEnum | null,
): StatusEnum | null => {
  if (!phaseData || !resultName) return null;

  const suggestedContactStatuses = phaseData.resultOptions.results
    ? phaseData.resultOptions.results.find(
        (result) => result.name === resultName,
      )
    : null;
  // TODO - Will need to replace ResultEnum with new results options
  return suggestedContactStatuses
    ? suggestedContactStatuses.suggestedContactStatus
    : null;
};
