import * as Types from '../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetUserOptionsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetUserOptionsQuery = (
  { __typename?: 'Query' }
  & { userOptions: Array<(
    { __typename?: 'Option' }
    & Pick<Types.Option, 'id' | 'key' | 'value'>
  )> }
);


export const GetUserOptionsDocument = gql`
    query GetUserOptions {
  userOptions {
    id
    key
    value
  }
}
    `;
export function useGetUserOptionsQuery(baseOptions?: Apollo.QueryHookOptions<GetUserOptionsQuery, GetUserOptionsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetUserOptionsQuery, GetUserOptionsQueryVariables>(GetUserOptionsDocument, options);
      }
export function useGetUserOptionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUserOptionsQuery, GetUserOptionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetUserOptionsQuery, GetUserOptionsQueryVariables>(GetUserOptionsDocument, options);
        }
export type GetUserOptionsQueryHookResult = ReturnType<typeof useGetUserOptionsQuery>;
export type GetUserOptionsLazyQueryHookResult = ReturnType<typeof useGetUserOptionsLazyQuery>;
export type GetUserOptionsQueryResult = Apollo.QueryResult<GetUserOptionsQuery, GetUserOptionsQueryVariables>;