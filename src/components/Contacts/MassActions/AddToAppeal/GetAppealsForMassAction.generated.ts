import * as Types from '../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetAppealsForMassActionQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  after?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;

export type GetAppealsForMassActionQuery = { __typename?: 'Query' } & {
  appeals: { __typename?: 'AppealConnection' } & {
    nodes: Array<
      { __typename?: 'Appeal' } & Pick<
        Types.Appeal,
        'id' | 'name' | 'contactIds'
      >
    >;
    pageInfo: { __typename?: 'PageInfo' } & Pick<
      Types.PageInfo,
      'endCursor' | 'hasNextPage'
    >;
  };
};

export const GetAppealsForMassActionDocument = gql`
  query GetAppealsForMassAction($accountListId: ID!, $after: String) {
    appeals(accountListId: $accountListId, first: 25, after: $after) {
      nodes {
        id
        name
        contactIds
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`;
export function useGetAppealsForMassActionQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetAppealsForMassActionQuery,
    GetAppealsForMassActionQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetAppealsForMassActionQuery,
    GetAppealsForMassActionQueryVariables
  >(GetAppealsForMassActionDocument, options);
}
export function useGetAppealsForMassActionLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetAppealsForMassActionQuery,
    GetAppealsForMassActionQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetAppealsForMassActionQuery,
    GetAppealsForMassActionQueryVariables
  >(GetAppealsForMassActionDocument, options);
}
export type GetAppealsForMassActionQueryHookResult = ReturnType<
  typeof useGetAppealsForMassActionQuery
>;
export type GetAppealsForMassActionLazyQueryHookResult = ReturnType<
  typeof useGetAppealsForMassActionLazyQuery
>;
export type GetAppealsForMassActionQueryResult = Apollo.QueryResult<
  GetAppealsForMassActionQuery,
  GetAppealsForMassActionQueryVariables
>;
