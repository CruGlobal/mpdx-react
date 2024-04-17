import { ResultEnum } from 'src/graphql/types.generated';
import { TaskPhase } from 'src/hooks/useContactPhaseData';

export const possibleResults = (phaseData: TaskPhase | null): ResultEnum[] => {
  if (!phaseData) return [];

  const results =
    phaseData?.results?.resultOptions?.map(
      (result) => result.name.value || '',
    ) || [];
  // TODO - ensure we fix this with real type
  return results as ResultEnum[];
};
