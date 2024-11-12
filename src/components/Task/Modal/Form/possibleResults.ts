import { DisplayResultEnum, Phase } from 'src/graphql/types.generated';

export const possibleResults = (
  phaseData: Phase | null,
): DisplayResultEnum[] => {
  if (!phaseData) {
    return [];
  }

  return phaseData?.results?.resultOptions?.map((result) => result.name) || [];
};
