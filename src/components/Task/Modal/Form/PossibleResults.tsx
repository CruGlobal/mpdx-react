import { IdValue, ResultEnum } from 'src/graphql/types.generated';
import { TaskPhase } from 'src/hooks/useContactPhaseData';
import { NewResultEnum } from 'src/utils/contacts/getContactPhaseDataMock';

type PossibleResults = { id: ResultEnum | NewResultEnum } & Pick<
  IdValue,
  '__typename' | 'value'
>;

const defaultResults: PossibleResults[] = [
  { id: ResultEnum.Completed },
  { id: ResultEnum.Attempted },
  { id: ResultEnum.AttemptedLeftMessage },
  { id: ResultEnum.Received },
];

export const possibleResults = (
  phaseData: TaskPhase | null,
): PossibleResults[] => {
  if (!phaseData) return defaultResults;

  const results =
    phaseData?.results?.resultOptions?.filter((result) => result.name.id) || [];

  return results.length
    ? results.map((result) => ({
        ...result.name,
        id: result.name.id as NewResultEnum,
      }))
    : defaultResults;
};
