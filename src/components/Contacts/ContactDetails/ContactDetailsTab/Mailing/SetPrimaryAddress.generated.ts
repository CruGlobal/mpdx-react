import * as Types from '../../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type PrimaryMailingAddressFragment = { __typename?: 'Address' } & Pick<
  Types.Address,
  'primaryMailingAddress'
>;

export type ContactPrimaryAddressRelationFragment = {
  __typename?: 'Contact';
} & {
  primaryAddress?: Types.Maybe<
    { __typename?: 'Address' } & Pick<Types.Address, 'id'>
  >;
};

export type SetContactPrimaryAddressMutationVariables = Types.Exact<{
  contactId: Types.Scalars['ID']['input'];
  primaryAddressId?: Types.InputMaybe<Types.Scalars['ID']['input']>;
}>;

export type SetContactPrimaryAddressMutation = { __typename?: 'Mutation' } & {
  setContactPrimaryAddress: { __typename?: 'ContactPrimaryAddress' } & {
    addresses: Array<
      { __typename?: 'AddressWithPrimary' } & Pick<
        Types.AddressWithPrimary,
        'id' | 'primaryMailingAddress'
      >
    >;
  };
};

export const PrimaryMailingAddressFragmentDoc = gql`
  fragment PrimaryMailingAddress on Address {
    primaryMailingAddress
  }
`;
export const ContactPrimaryAddressRelationFragmentDoc = gql`
  fragment ContactPrimaryAddressRelation on Contact {
    primaryAddress {
      id
    }
  }
`;
export const SetContactPrimaryAddressDocument = gql`
  mutation SetContactPrimaryAddress($contactId: ID!, $primaryAddressId: ID) {
    setContactPrimaryAddress(
      input: { contactId: $contactId, primaryAddressId: $primaryAddressId }
    ) {
      addresses {
        id
        primaryMailingAddress
      }
    }
  }
`;
export type SetContactPrimaryAddressMutationFn = Apollo.MutationFunction<
  SetContactPrimaryAddressMutation,
  SetContactPrimaryAddressMutationVariables
>;
export function useSetContactPrimaryAddressMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SetContactPrimaryAddressMutation,
    SetContactPrimaryAddressMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SetContactPrimaryAddressMutation,
    SetContactPrimaryAddressMutationVariables
  >(SetContactPrimaryAddressDocument, options);
}
export type SetContactPrimaryAddressMutationHookResult = ReturnType<
  typeof useSetContactPrimaryAddressMutation
>;
export type SetContactPrimaryAddressMutationResult =
  Apollo.MutationResult<SetContactPrimaryAddressMutation>;
export type SetContactPrimaryAddressMutationOptions =
  Apollo.BaseMutationOptions<
    SetContactPrimaryAddressMutation,
    SetContactPrimaryAddressMutationVariables
  >;
