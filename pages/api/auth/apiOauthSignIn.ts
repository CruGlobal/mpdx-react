/* eslint-disable */
import * as Types from '../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ApiOauthSignInMutationVariables = Types.Exact<{
  accessToken: Types.Scalars['String'];
}>;

type ApiOauthSignInMutationPayload = {
  __typename?: 'ApiOauthSignInMutationPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Types.Maybe<Types.Scalars['String']>;
  token?: Types.Maybe<Types.Scalars['String']>;
  user?: Types.Maybe<Types.User>;
};

// Graphql apiOauthSignIn is not added to MPDX API Prod, only to MPDX API Staging for security reasons.
// We've added the generated file for apiOauthSignIn and not the GraphQl file since it will cause build errors on prod.

export type ApiOauthSignInMutation = { __typename?: 'Mutation' } & {
  apiOauthSignIn?: Types.Maybe<
    { __typename?: 'ApiOauthSignInMutationPayload' } & Pick<
      ApiOauthSignInMutationPayload,
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

export const ApiOauthSignInDocument = gql`
  mutation apiOauthSignIn($accessToken: String!) {
    apiOauthSignIn(input: { accessToken: $accessToken }) {
      token
      user {
        id
        name: firstName
      }
    }
  }
`;
export type ApiOauthSignInMutationFn = Apollo.MutationFunction<
  ApiOauthSignInMutation,
  ApiOauthSignInMutationVariables
>;

/**
 * __useApiOauthSignInMutation__
 *
 * To run a mutation, you first call `useApiOauthSignInMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useApiOauthSignInMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [apiOauthSignInMutation, { data, loading, error }] = useApiOauthSignInMutation({
 *   variables: {
 *      accessToken: // value for 'accessToken'
 *   },
 * });
 */
export function useApiOauthSignInMutation(
  baseOptions?: Apollo.MutationHookOptions<
    ApiOauthSignInMutation,
    ApiOauthSignInMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    ApiOauthSignInMutation,
    ApiOauthSignInMutationVariables
  >(ApiOauthSignInDocument, options);
}
export type ApiOauthSignInMutationHookResult = ReturnType<
  typeof useApiOauthSignInMutation
>;
export type ApiOauthSignInMutationResult =
  Apollo.MutationResult<ApiOauthSignInMutation>;
export type ApiOauthSignInMutationOptions = Apollo.BaseMutationOptions<
  ApiOauthSignInMutation,
  ApiOauthSignInMutationVariables
>;
