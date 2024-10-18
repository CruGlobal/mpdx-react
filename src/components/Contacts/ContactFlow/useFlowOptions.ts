import { useMemo } from 'react';
import { StatusEnum } from 'src/graphql/types.generated';
import { convertStatus } from 'src/utils/functions/convertContactStatus';
import { useGetUserOptionsQuery } from './GetUserOptions.generated';

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

interface UseFlowOptionReturn {
  options: FlowOption[];
  loading: boolean;
}

export const useFlowOptions = (): UseFlowOptionReturn => {
  const { data, loading } = useGetUserOptionsQuery();

  const options = useMemo(() => {
    const rawOptions: RawFlowOption[] = JSON.parse(
      data?.userOptions.find((option) => option.key === 'flows')?.value || '[]',
    );
    return rawOptions.map((option) => ({
      ...option,
      statuses: option.statuses
        .map((status) => convertStatus(status))
        // Ignore null values that didn't match a valid status
        .filter(isTruthy),
    }));
  }, [data]);

  return { options, loading };
};
