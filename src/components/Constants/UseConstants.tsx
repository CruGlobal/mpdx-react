import { useQuery } from '@apollo/client';
import { LoadConstantsDocument } from './LoadConstants.generated';

export const UseApiConstants = useQuery(LoadConstantsDocument, {
  fetchPolicy: 'cache-first',
});
