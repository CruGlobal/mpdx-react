import { useQuery } from '@apollo/client';
import { LoadConstantsDocument } from './LoadConstants.generated';

// Use this call to force loading from cache storage first
export const UseApiConstants = useQuery(LoadConstantsDocument, {
  fetchPolicy: 'cache-first',
});
