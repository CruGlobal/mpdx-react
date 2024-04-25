import * as Types from '../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type SendToChalklineMutationVariables = Types.Exact<{
  input: Types.SendToChalklineInput;
}>;


export type SendToChalklineMutation = (
  { __typename?: 'Mutation' }
  & Pick<Types.Mutation, 'sendToChalkline'>
);


export const SendToChalklineDocument = gql`
    mutation SendToChalkline($input: SendToChalklineInput!) {
  sendToChalkline(input: $input)
}
    `;
export type SendToChalklineMutationFn = Apollo.MutationFunction<SendToChalklineMutation, SendToChalklineMutationVariables>;
export function useSendToChalklineMutation(baseOptions?: Apollo.MutationHookOptions<SendToChalklineMutation, SendToChalklineMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SendToChalklineMutation, SendToChalklineMutationVariables>(SendToChalklineDocument, options);
      }
export type SendToChalklineMutationHookResult = ReturnType<typeof useSendToChalklineMutation>;
export type SendToChalklineMutationResult = Apollo.MutationResult<SendToChalklineMutation>;
export type SendToChalklineMutationOptions = Apollo.BaseMutationOptions<SendToChalklineMutation, SendToChalklineMutationVariables>;