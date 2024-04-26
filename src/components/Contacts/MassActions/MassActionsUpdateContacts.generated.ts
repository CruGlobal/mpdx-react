import * as Types from '../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type MassActionsUpdateContactsMutationVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  attributes: Array<Types.ContactUpdateInput> | Types.ContactUpdateInput;
}>;

export type MassActionsUpdateContactsMutation = { __typename?: 'Mutation' } & {
  updateContacts?: Types.Maybe<
    { __typename?: 'ContactsUpdateMutationPayload' } & {
      contacts: Array<{ __typename?: 'Contact' } & Pick<Types.Contact, 'id'>>;
    }
  >;
};

export const MassActionsUpdateContactsDocument = gql`
  mutation MassActionsUpdateContacts(
    $accountListId: ID!
    $attributes: [ContactUpdateInput!]!
  ) {
    updateContacts(
      input: { accountListId: $accountListId, attributes: $attributes }
    ) {
      contacts {
        id
      }
    }
  }
`;
export type MassActionsUpdateContactsMutationFn = Apollo.MutationFunction<
  MassActionsUpdateContactsMutation,
  MassActionsUpdateContactsMutationVariables
>;
export function useMassActionsUpdateContactsMutation(
  baseOptions?: Apollo.MutationHookOptions<
    MassActionsUpdateContactsMutation,
    MassActionsUpdateContactsMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    MassActionsUpdateContactsMutation,
    MassActionsUpdateContactsMutationVariables
  >(MassActionsUpdateContactsDocument, options);
}
export type MassActionsUpdateContactsMutationHookResult = ReturnType<
  typeof useMassActionsUpdateContactsMutation
>;
export type MassActionsUpdateContactsMutationResult =
  Apollo.MutationResult<MassActionsUpdateContactsMutation>;
export type MassActionsUpdateContactsMutationOptions =
  Apollo.BaseMutationOptions<
    MassActionsUpdateContactsMutation,
    MassActionsUpdateContactsMutationVariables
  >;
