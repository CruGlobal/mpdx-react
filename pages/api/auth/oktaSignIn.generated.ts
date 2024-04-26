import * as Types from '../../../src/graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type OktaSignInMutationVariables = Types.Exact<{
  accessToken: Types.Scalars['String']['input'];
}>;

export type OktaSignInMutation = { __typename?: 'Mutation' } & {
  oktaSignIn?: Types.Maybe<
    { __typename?: 'OktaSignInMutationPayload' } & Pick<
      Types.OktaSignInMutationPayload,
      'token'
    > & {
        user?: Types.Maybe<
          { __typename?: 'User' } & Pick<Types.User, 'id'> & {
              name: Types.User['firstName'];
            }
        >;
      }
  >;
};

export const OktaSignInDocument = gql`
  mutation oktaSignIn($accessToken: String!) {
    oktaSignIn(input: { accessToken: $accessToken }) {
      token
      user {
        id
        name: firstName
      }
    }
  }
`;
export type OktaSignInMutationFn = Apollo.MutationFunction<
  OktaSignInMutation,
  OktaSignInMutationVariables
>;
export function useOktaSignInMutation(
  baseOptions?: Apollo.MutationHookOptions<
    OktaSignInMutation,
    OktaSignInMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<OktaSignInMutation, OktaSignInMutationVariables>(
    OktaSignInDocument,
    options,
  );
}
export type OktaSignInMutationHookResult = ReturnType<
  typeof useOktaSignInMutation
>;
export type OktaSignInMutationResult =
  Apollo.MutationResult<OktaSignInMutation>;
export type OktaSignInMutationOptions = Apollo.BaseMutationOptions<
  OktaSignInMutation,
  OktaSignInMutationVariables
>;
