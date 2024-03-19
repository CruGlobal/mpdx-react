import { ResultEnum } from 'src/graphql/types.generated';
import {
  ContactPhaseData,
  NewResultEnum,
} from 'src/hooks/useContactPhaseDataMockData';

export const possibleResults = (
  phaseData: ContactPhaseData | null,
): (ResultEnum | NewResultEnum)[] => {
  if (!phaseData) return [];

  const results = phaseData.resultOptions.results
    ? phaseData.resultOptions.results.map((result) => result.name)
    : [];
  // TODO - Will need to replace ResultEnum with new results options
  return results;
};
