import {
  DisplayResultEnum,
  Phase,
  ResultEnum,
} from 'src/graphql/types.generated';

export const possibleResults = (
  phaseData: Phase | null,
): ResultEnum[] | DisplayResultEnum[] => {
  if (!phaseData) {
    return [];
  }

  return phaseData?.results?.resultOptions?.map((result) => result.name) || [];
};
