import {
  LoadConstantsQuery,
  useLoadConstantsQuery,
} from './LoadConstants.generated';

// Use this call to force loading from cache storage first
export const useApiConstants = ():
  | LoadConstantsQuery['constant']
  | undefined => {
  const { data } = useLoadConstantsQuery({
    fetchPolicy: 'cache-first',
  });

  return data?.constant;
};
