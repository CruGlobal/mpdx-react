import { Constant } from '../../../graphql/types.generated';
import { useLoadConstantsQuery } from './LoadConstants.generated';

// Use this call to force loading from cache storage first
export const useApiConstants = (): Constant => {
  const { data } = useLoadConstantsQuery({
    fetchPolicy: 'cache-first',
  });

  return data?.constant;
};
