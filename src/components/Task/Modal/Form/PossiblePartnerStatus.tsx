import {
  IdKeyValue,
  ResultEnum,
  StatusEnum,
} from 'src/graphql/types.generated';
import { TaskPhase } from 'src/hooks/useContactPhaseData';
import { NewResultEnum } from 'src/utils/contacts/getContactPhaseDataMock';

type PossiblePartnerStatus = {
  dbResult?: ({ id: StatusEnum } & Omit<IdKeyValue, 'id'>) | null;
  suggestedContactStatus: StatusEnum;
};

export const possiblePartnerStatus = (
  phaseData: TaskPhase | null,
  resultName: (ResultEnum | NewResultEnum) | null,
): PossiblePartnerStatus | null => {
  if (!phaseData || !resultName) return null;

  const contactStatus =
    phaseData?.results?.resultOptions?.find(
      (result) => result.name.id === resultName,
    ) ?? null;

  const dbResult = contactStatus?.dbResult
    ? {
        ...contactStatus?.dbResult[0],
        id: contactStatus?.dbResult[0].id as StatusEnum,
      }
    : null;

  return {
    dbResult,
    suggestedContactStatus: contactStatus?.suggestedContactStatus as StatusEnum,
  };
};
