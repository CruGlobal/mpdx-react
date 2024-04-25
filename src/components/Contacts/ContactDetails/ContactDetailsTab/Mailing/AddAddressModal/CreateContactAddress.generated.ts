import * as Types from '../../../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type CreateContactAddressMutationVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  attributes: Types.AddressCreateInput;
}>;


export type CreateContactAddressMutation = (
  { __typename?: 'Mutation' }
  & { createAddress?: Types.Maybe<(
    { __typename?: 'AddressCreateMutationPayload' }
    & { address: (
      { __typename?: 'Address' }
      & Pick<Types.Address, 'id' | 'city' | 'country' | 'historic' | 'location' | 'metroArea' | 'postalCode' | 'primaryMailingAddress' | 'region' | 'source' | 'state' | 'street' | 'createdAt'>
    ) }
  )> }
);


export const CreateContactAddressDocument = gql`
    mutation CreateContactAddress($accountListId: ID!, $attributes: AddressCreateInput!) {
  createAddress(input: {accountListId: $accountListId, attributes: $attributes}) {
    address {
      id
      city
      country
      historic
      location
      metroArea
      postalCode
      primaryMailingAddress
      region
      source
      state
      street
      createdAt
    }
  }
}
    `;
export type CreateContactAddressMutationFn = Apollo.MutationFunction<CreateContactAddressMutation, CreateContactAddressMutationVariables>;
export function useCreateContactAddressMutation(baseOptions?: Apollo.MutationHookOptions<CreateContactAddressMutation, CreateContactAddressMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateContactAddressMutation, CreateContactAddressMutationVariables>(CreateContactAddressDocument, options);
      }
export type CreateContactAddressMutationHookResult = ReturnType<typeof useCreateContactAddressMutation>;
export type CreateContactAddressMutationResult = Apollo.MutationResult<CreateContactAddressMutation>;
export type CreateContactAddressMutationOptions = Apollo.BaseMutationOptions<CreateContactAddressMutation, CreateContactAddressMutationVariables>;