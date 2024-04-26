import * as Types from '../../../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type EditMailingInfoMutationVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  attributes: Types.ContactUpdateInput;
}>;

export type EditMailingInfoMutation = { __typename?: 'Mutation' } & {
  updateContact?: Types.Maybe<
    { __typename?: 'ContactUpdateMutationPayload' } & {
      contact: { __typename?: 'Contact' } & Pick<
        Types.Contact,
        'id' | 'greeting' | 'envelopeGreeting' | 'sendNewsletter'
      >;
    }
  >;
};

export const EditMailingInfoDocument = gql`
  mutation EditMailingInfo(
    $accountListId: ID!
    $attributes: ContactUpdateInput!
  ) {
    updateContact(
      input: { accountListId: $accountListId, attributes: $attributes }
    ) {
      contact {
        id
        greeting
        envelopeGreeting
        sendNewsletter
      }
    }
  }
`;
export type EditMailingInfoMutationFn = Apollo.MutationFunction<
  EditMailingInfoMutation,
  EditMailingInfoMutationVariables
>;
export function useEditMailingInfoMutation(
  baseOptions?: Apollo.MutationHookOptions<
    EditMailingInfoMutation,
    EditMailingInfoMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    EditMailingInfoMutation,
    EditMailingInfoMutationVariables
  >(EditMailingInfoDocument, options);
}
export type EditMailingInfoMutationHookResult = ReturnType<
  typeof useEditMailingInfoMutation
>;
export type EditMailingInfoMutationResult =
  Apollo.MutationResult<EditMailingInfoMutation>;
export type EditMailingInfoMutationOptions = Apollo.BaseMutationOptions<
  EditMailingInfoMutation,
  EditMailingInfoMutationVariables
>;
