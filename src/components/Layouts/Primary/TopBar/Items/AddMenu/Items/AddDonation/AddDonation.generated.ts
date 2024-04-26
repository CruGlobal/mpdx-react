import * as Types from '../../../../../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetDonationModalQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
}>;

export type GetDonationModalQuery = { __typename?: 'Query' } & {
  accountList: { __typename?: 'AccountList' } & Pick<
    Types.AccountList,
    'id' | 'currency'
  > & {
      appeals?: Types.Maybe<
        Array<
          { __typename?: 'Appeal' } & Pick<
            Types.Appeal,
            'active' | 'name' | 'id'
          >
        >
      >;
    };
};

export type AddDonationMutationVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  attributes: Types.DonationCreateInput;
}>;

export type AddDonationMutation = { __typename?: 'Mutation' } & {
  createDonation?: Types.Maybe<
    { __typename?: 'DonationCreateMutationPayload' } & {
      donation: { __typename?: 'Donation' } & Pick<Types.Donation, 'id'>;
    }
  >;
};

export const GetDonationModalDocument = gql`
  query GetDonationModal($accountListId: ID!) {
    accountList(id: $accountListId) {
      id
      currency
      appeals {
        active
        name
        id
      }
    }
  }
`;
export function useGetDonationModalQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetDonationModalQuery,
    GetDonationModalQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetDonationModalQuery, GetDonationModalQueryVariables>(
    GetDonationModalDocument,
    options,
  );
}
export function useGetDonationModalLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetDonationModalQuery,
    GetDonationModalQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetDonationModalQuery,
    GetDonationModalQueryVariables
  >(GetDonationModalDocument, options);
}
export type GetDonationModalQueryHookResult = ReturnType<
  typeof useGetDonationModalQuery
>;
export type GetDonationModalLazyQueryHookResult = ReturnType<
  typeof useGetDonationModalLazyQuery
>;
export type GetDonationModalQueryResult = Apollo.QueryResult<
  GetDonationModalQuery,
  GetDonationModalQueryVariables
>;
export const AddDonationDocument = gql`
  mutation AddDonation($accountListId: ID!, $attributes: DonationCreateInput!) {
    createDonation(
      input: { accountListId: $accountListId, attributes: $attributes }
    ) {
      donation {
        id
      }
    }
  }
`;
export type AddDonationMutationFn = Apollo.MutationFunction<
  AddDonationMutation,
  AddDonationMutationVariables
>;
export function useAddDonationMutation(
  baseOptions?: Apollo.MutationHookOptions<
    AddDonationMutation,
    AddDonationMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<AddDonationMutation, AddDonationMutationVariables>(
    AddDonationDocument,
    options,
  );
}
export type AddDonationMutationHookResult = ReturnType<
  typeof useAddDonationMutation
>;
export type AddDonationMutationResult =
  Apollo.MutationResult<AddDonationMutation>;
export type AddDonationMutationOptions = Apollo.BaseMutationOptions<
  AddDonationMutation,
  AddDonationMutationVariables
>;
