import * as Types from '../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type EditDonationModalDonationFragment = {
  __typename?: 'Donation';
} & Pick<
  Types.Donation,
  'id' | 'donationDate' | 'memo' | 'motivation' | 'paymentMethod' | 'remoteId'
> & {
    amount: { __typename?: 'Money' } & Pick<Types.Money, 'amount' | 'currency'>;
    appeal?: Types.Maybe<{ __typename?: 'Appeal' } & Pick<Types.Appeal, 'id'>>;
    appealAmount?: Types.Maybe<
      { __typename?: 'Money' } & Pick<Types.Money, 'amount'>
    >;
    donorAccount: { __typename?: 'DonorAccount' } & Pick<
      Types.DonorAccount,
      'id' | 'displayName'
    > & {
        contacts: { __typename?: 'ContactConnection' } & {
          nodes: Array<{ __typename?: 'Contact' } & Pick<Types.Contact, 'id'>>;
        };
      };
    designationAccount: { __typename?: 'DesignationAccount' } & Pick<
      Types.DesignationAccount,
      'id' | 'name'
    >;
  };

export type GetDesignationAccountsQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
}>;

export type GetDesignationAccountsQuery = { __typename?: 'Query' } & {
  designationAccounts: Array<
    { __typename?: 'DesignationAccountsGroup' } & {
      designationAccounts: Array<
        { __typename?: 'DesignationAccountRest' } & Pick<
          Types.DesignationAccountRest,
          'id' | 'name' | 'active'
        >
      >;
    }
  >;
};

export type EditDonationModalGetAppealsQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  after?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;

export type EditDonationModalGetAppealsQuery = { __typename?: 'Query' } & {
  appeals: { __typename?: 'AppealConnection' } & {
    nodes: Array<{ __typename?: 'Appeal' } & Pick<Types.Appeal, 'id' | 'name'>>;
    pageInfo: { __typename?: 'PageInfo' } & Pick<
      Types.PageInfo,
      'endCursor' | 'hasNextPage'
    >;
  };
};

export type UpdateDonationMutationVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  attributes: Types.DonationUpdateInput;
}>;

export type UpdateDonationMutation = { __typename?: 'Mutation' } & {
  updateDonation?: Types.Maybe<
    { __typename?: 'DonationUpdateMutationPayload' } & {
      donation: { __typename?: 'Donation' } & Pick<
        Types.Donation,
        | 'id'
        | 'donationDate'
        | 'memo'
        | 'motivation'
        | 'paymentMethod'
        | 'remoteId'
      > & {
          amount: { __typename?: 'Money' } & Pick<
            Types.Money,
            'amount' | 'currency'
          >;
          appeal?: Types.Maybe<
            { __typename?: 'Appeal' } & Pick<Types.Appeal, 'id'>
          >;
          appealAmount?: Types.Maybe<
            { __typename?: 'Money' } & Pick<Types.Money, 'amount'>
          >;
          donorAccount: { __typename?: 'DonorAccount' } & Pick<
            Types.DonorAccount,
            'id' | 'displayName'
          > & {
              contacts: { __typename?: 'ContactConnection' } & {
                nodes: Array<
                  { __typename?: 'Contact' } & Pick<Types.Contact, 'id'>
                >;
              };
            };
          designationAccount: { __typename?: 'DesignationAccount' } & Pick<
            Types.DesignationAccount,
            'id' | 'name'
          >;
        };
    }
  >;
};

export type DeleteDonationMutationVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  id: Types.Scalars['ID']['input'];
}>;

export type DeleteDonationMutation = { __typename?: 'Mutation' } & {
  deleteDonation?: Types.Maybe<
    { __typename?: 'DonationDeleteMutationPayload' } & Pick<
      Types.DonationDeleteMutationPayload,
      'id'
    >
  >;
};

export const EditDonationModalDonationFragmentDoc = gql`
  fragment EditDonationModalDonation on Donation {
    id
    amount {
      amount
      currency
    }
    appeal {
      id
    }
    appealAmount {
      amount
    }
    donationDate
    donorAccount {
      id
      contacts(first: 25) {
        nodes {
          id
        }
      }
      displayName
    }
    designationAccount {
      id
      name
    }
    memo
    motivation
    paymentMethod
    remoteId
  }
`;
export const GetDesignationAccountsDocument = gql`
  query GetDesignationAccounts($accountListId: ID!) {
    designationAccounts(accountListId: $accountListId) {
      designationAccounts {
        id
        name
        active
      }
    }
  }
`;
export function useGetDesignationAccountsQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetDesignationAccountsQuery,
    GetDesignationAccountsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetDesignationAccountsQuery,
    GetDesignationAccountsQueryVariables
  >(GetDesignationAccountsDocument, options);
}
export function useGetDesignationAccountsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetDesignationAccountsQuery,
    GetDesignationAccountsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetDesignationAccountsQuery,
    GetDesignationAccountsQueryVariables
  >(GetDesignationAccountsDocument, options);
}
export type GetDesignationAccountsQueryHookResult = ReturnType<
  typeof useGetDesignationAccountsQuery
>;
export type GetDesignationAccountsLazyQueryHookResult = ReturnType<
  typeof useGetDesignationAccountsLazyQuery
>;
export type GetDesignationAccountsQueryResult = Apollo.QueryResult<
  GetDesignationAccountsQuery,
  GetDesignationAccountsQueryVariables
>;
export const EditDonationModalGetAppealsDocument = gql`
  query EditDonationModalGetAppeals($accountListId: ID!, $after: String) {
    appeals(accountListId: $accountListId, first: 50, after: $after) {
      nodes {
        id
        name
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`;
export function useEditDonationModalGetAppealsQuery(
  baseOptions: Apollo.QueryHookOptions<
    EditDonationModalGetAppealsQuery,
    EditDonationModalGetAppealsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    EditDonationModalGetAppealsQuery,
    EditDonationModalGetAppealsQueryVariables
  >(EditDonationModalGetAppealsDocument, options);
}
export function useEditDonationModalGetAppealsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    EditDonationModalGetAppealsQuery,
    EditDonationModalGetAppealsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    EditDonationModalGetAppealsQuery,
    EditDonationModalGetAppealsQueryVariables
  >(EditDonationModalGetAppealsDocument, options);
}
export type EditDonationModalGetAppealsQueryHookResult = ReturnType<
  typeof useEditDonationModalGetAppealsQuery
>;
export type EditDonationModalGetAppealsLazyQueryHookResult = ReturnType<
  typeof useEditDonationModalGetAppealsLazyQuery
>;
export type EditDonationModalGetAppealsQueryResult = Apollo.QueryResult<
  EditDonationModalGetAppealsQuery,
  EditDonationModalGetAppealsQueryVariables
>;
export const UpdateDonationDocument = gql`
  mutation UpdateDonation(
    $accountListId: ID!
    $attributes: DonationUpdateInput!
  ) {
    updateDonation(
      input: { accountListId: $accountListId, attributes: $attributes }
    ) {
      donation {
        ...EditDonationModalDonation
      }
    }
  }
  ${EditDonationModalDonationFragmentDoc}
`;
export type UpdateDonationMutationFn = Apollo.MutationFunction<
  UpdateDonationMutation,
  UpdateDonationMutationVariables
>;
export function useUpdateDonationMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateDonationMutation,
    UpdateDonationMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateDonationMutation,
    UpdateDonationMutationVariables
  >(UpdateDonationDocument, options);
}
export type UpdateDonationMutationHookResult = ReturnType<
  typeof useUpdateDonationMutation
>;
export type UpdateDonationMutationResult =
  Apollo.MutationResult<UpdateDonationMutation>;
export type UpdateDonationMutationOptions = Apollo.BaseMutationOptions<
  UpdateDonationMutation,
  UpdateDonationMutationVariables
>;
export const DeleteDonationDocument = gql`
  mutation DeleteDonation($accountListId: ID!, $id: ID!) {
    deleteDonation(input: { accountListId: $accountListId, id: $id }) {
      id
    }
  }
`;
export type DeleteDonationMutationFn = Apollo.MutationFunction<
  DeleteDonationMutation,
  DeleteDonationMutationVariables
>;
export function useDeleteDonationMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeleteDonationMutation,
    DeleteDonationMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    DeleteDonationMutation,
    DeleteDonationMutationVariables
  >(DeleteDonationDocument, options);
}
export type DeleteDonationMutationHookResult = ReturnType<
  typeof useDeleteDonationMutation
>;
export type DeleteDonationMutationResult =
  Apollo.MutationResult<DeleteDonationMutation>;
export type DeleteDonationMutationOptions = Apollo.BaseMutationOptions<
  DeleteDonationMutation,
  DeleteDonationMutationVariables
>;
