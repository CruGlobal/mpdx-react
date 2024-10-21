import { useMemo } from 'react';
import { StatusEnum } from 'src/graphql/types.generated';
import { useUserPreference } from 'src/hooks/useUserPreference';
import { convertStatus } from 'src/utils/functions/convertContactStatus';

const isTruthy = <T>(value: T): value is NonNullable<T> => Boolean(value);

interface RawFlowOption extends Omit<FlowOption, 'statuses'> {
  statuses: string[];
}

export interface FlowOption {
  name: string;
  statuses: StatusEnum[];
  color: string;
  id: string;
}

type UseFlowOptionReturn = [
  FlowOption[],
  (options: FlowOption[]) => void,
  { loading: boolean },
];

export const useFlowOptions = (): UseFlowOptionReturn => {
  const [options, setOptions, { loading }] = useUserPreference<RawFlowOption[]>(
    {
      key: 'flows',
      defaultValue: [],
    },
  );

  const convertedOptions = useMemo(
    () =>
      options.map((option) => ({
        ...option,
        statuses: option.statuses
          .map((status) => convertStatus(status))
          // Ignore null values that didn't match a valid status
          .filter(isTruthy),
      })),
    [options],
  );

  return [convertedOptions, setOptions, { loading }];
};
