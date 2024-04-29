import {
  DisplayResultEnum,
  Phase,
  ResultEnum,
} from 'src/graphql/types.generated';

const defaultResults: ResultEnum[] = [
  ResultEnum.Completed,
  ResultEnum.Attempted,
  ResultEnum.AttemptedLeftMessage,
  ResultEnum.Received,
];

export const possibleResults = (
  phaseData: Phase | null,
): ResultEnum[] | DisplayResultEnum[] => {
  if (!phaseData) return defaultResults;

  return (
    phaseData?.results?.resultOptions?.map((result) => result.name) ||
    defaultResults
  );
};
