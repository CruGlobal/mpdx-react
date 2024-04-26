import * as Types from '../../../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type DonationServicesEmailQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  contactId: Types.Scalars['ID']['input'];
}>;

export type DonationServicesEmailQuery = { __typename?: 'Query' } & {
  contact: { __typename?: 'Contact' } & Pick<Types.Contact, 'name'>;
  user: { __typename?: 'User' } & Pick<Types.User, 'firstName'>;
};

export type UpdateContactAddressMutationVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  attributes: Types.AddressUpdateInput;
}>;

export type UpdateContactAddressMutation = { __typename?: 'Mutation' } & {
  updateAddress?: Types.Maybe<
    { __typename?: 'AddressUpdateMutationPayload' } & {
      address: { __typename?: 'Address' } & Pick<
        Types.Address,
        | 'city'
        | 'country'
        | 'historic'
        | 'id'
        | 'location'
        | 'metroArea'
        | 'postalCode'
        | 'primaryMailingAddress'
        | 'region'
        | 'state'
        | 'street'
      >;
    }
  >;
};

export type DeleteContactAddressMutationVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  id: Types.Scalars['ID']['input'];
}>;

export type DeleteContactAddressMutation = { __typename?: 'Mutation' } & {
  deleteAddress?: Types.Maybe<
    { __typename?: 'AddressDeleteMutationPayload' } & Pick<
      Types.AddressDeleteMutationPayload,
      'id'
    >
  >;
};

export const DonationServicesEmailDocument = gql`
  query DonationServicesEmail($accountListId: ID!, $contactId: ID!) {
    contact(accountListId: $accountListId, id: $contactId) {
      name
    }
    user {
      firstName
    }
  }
`;
export function useDonationServicesEmailQuery(
  baseOptions: Apollo.QueryHookOptions<
    DonationServicesEmailQuery,
    DonationServicesEmailQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    DonationServicesEmailQuery,
    DonationServicesEmailQueryVariables
  >(DonationServicesEmailDocument, options);
}
export function useDonationServicesEmailLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    DonationServicesEmailQuery,
    DonationServicesEmailQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    DonationServicesEmailQuery,
    DonationServicesEmailQueryVariables
  >(DonationServicesEmailDocument, options);
}
export type DonationServicesEmailQueryHookResult = ReturnType<
  typeof useDonationServicesEmailQuery
>;
export type DonationServicesEmailLazyQueryHookResult = ReturnType<
  typeof useDonationServicesEmailLazyQuery
>;
export type DonationServicesEmailQueryResult = Apollo.QueryResult<
  DonationServicesEmailQuery,
  DonationServicesEmailQueryVariables
>;
export const UpdateContactAddressDocument = gql`
  mutation UpdateContactAddress(
    $accountListId: ID!
    $attributes: AddressUpdateInput!
  ) {
    updateAddress(
      input: { accountListId: $accountListId, attributes: $attributes }
    ) {
      address {
        city
        country
        historic
        id
        location
        metroArea
        postalCode
        primaryMailingAddress
        region
        state
        street
      }
    }
  }
`;
export type UpdateContactAddressMutationFn = Apollo.MutationFunction<
  UpdateContactAddressMutation,
  UpdateContactAddressMutationVariables
>;
export function useUpdateContactAddressMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateContactAddressMutation,
    UpdateContactAddressMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateContactAddressMutation,
    UpdateContactAddressMutationVariables
  >(UpdateContactAddressDocument, options);
}
export type UpdateContactAddressMutationHookResult = ReturnType<
  typeof useUpdateContactAddressMutation
>;
export type UpdateContactAddressMutationResult =
  Apollo.MutationResult<UpdateContactAddressMutation>;
export type UpdateContactAddressMutationOptions = Apollo.BaseMutationOptions<
  UpdateContactAddressMutation,
  UpdateContactAddressMutationVariables
>;
export const DeleteContactAddressDocument = gql`
  mutation DeleteContactAddress($accountListId: ID!, $id: ID!) {
    deleteAddress(input: { accountListId: $accountListId, id: $id }) {
      id
    }
  }
`;
export type DeleteContactAddressMutationFn = Apollo.MutationFunction<
  DeleteContactAddressMutation,
  DeleteContactAddressMutationVariables
>;
export function useDeleteContactAddressMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeleteContactAddressMutation,
    DeleteContactAddressMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    DeleteContactAddressMutation,
    DeleteContactAddressMutationVariables
  >(DeleteContactAddressDocument, options);
}
export type DeleteContactAddressMutationHookResult = ReturnType<
  typeof useDeleteContactAddressMutation
>;
export type DeleteContactAddressMutationResult =
  Apollo.MutationResult<DeleteContactAddressMutation>;
export type DeleteContactAddressMutationOptions = Apollo.BaseMutationOptions<
  DeleteContactAddressMutation,
  DeleteContactAddressMutationVariables
>;
