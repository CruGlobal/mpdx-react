import { useLoadConstantsQuery } from './LoadConstants.generated';

// Use this call to force loading from cache storage first
export const useApiConstants = useLoadConstantsQuery({
  fetchPolicy: 'cache-first',
});
