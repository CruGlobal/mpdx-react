import * as Types from '../../../graphql/types.generated';

import { gql } from '@apollo/client';
import { UserFragmentFragmentDoc } from './GetProfileInfo.generated';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type UpdateUserMutationVariables = Types.Exact<{
  attributes: Types.UserUpdateInput;
}>;


export type UpdateUserMutation = (
  { __typename?: 'Mutation' }
  & { updateUser?: Types.Maybe<(
    { __typename?: 'UserUpdateMutationPayload' }
    & { user: (
      { __typename?: 'User' }
      & Pick<Types.User, 'lastName' | 'firstName' | 'legalFirstName' | 'title' | 'suffix' | 'id' | 'occupation' | 'employer' | 'anniversaryYear' | 'anniversaryDay' | 'anniversaryMonth' | 'almaMater' | 'maritalStatus' | 'birthdayDay' | 'birthdayMonth' | 'birthdayYear' | 'gender' | 'avatar'>
      & { primaryEmailAddress?: Types.Maybe<(
        { __typename?: 'EmailAddress' }
        & Pick<Types.EmailAddress, 'id' | 'email' | 'primary' | 'location' | 'source'>
      )>, primaryPhoneNumber?: Types.Maybe<(
        { __typename?: 'PhoneNumber' }
        & Pick<Types.PhoneNumber, 'id' | 'number' | 'primary' | 'location' | 'source'>
      )>, phoneNumbers: (
        { __typename?: 'PhoneNumberConnection' }
        & { nodes: Array<(
          { __typename?: 'PhoneNumber' }
          & Pick<Types.PhoneNumber, 'id' | 'number' | 'primary' | 'location' | 'source' | 'historic'>
        )> }
      ), emailAddresses: (
        { __typename?: 'EmailAddressConnection' }
        & { nodes: Array<(
          { __typename?: 'EmailAddress' }
          & Pick<Types.EmailAddress, 'id' | 'email' | 'primary' | 'location' | 'source' | 'historic'>
        )> }
      ), twitterAccounts: (
        { __typename?: 'TwitterAccountConnection' }
        & { nodes: Array<(
          { __typename?: 'TwitterAccount' }
          & Pick<Types.TwitterAccount, 'id' | 'screenName'>
        )> }
      ), websites: (
        { __typename?: 'WebsiteConnection' }
        & { nodes: Array<(
          { __typename?: 'Website' }
          & Pick<Types.Website, 'url' | 'id'>
        )> }
      ), linkedinAccounts: (
        { __typename?: 'LinkedinAccountConnection' }
        & { nodes: Array<(
          { __typename?: 'LinkedinAccount' }
          & Pick<Types.LinkedinAccount, 'id' | 'publicUrl'>
        )> }
      ), facebookAccounts: (
        { __typename?: 'FacebookAccountConnection' }
        & { nodes: Array<(
          { __typename?: 'FacebookAccount' }
          & Pick<Types.FacebookAccount, 'id' | 'username'>
        )> }
      ) }
    ) }
  )> }
);


export const UpdateUserDocument = gql`
    mutation UpdateUser($attributes: UserUpdateInput!) {
  updateUser(input: {attributes: $attributes}) {
    user {
      ...UserFragment
    }
  }
}
    ${UserFragmentFragmentDoc}`;
export type UpdateUserMutationFn = Apollo.MutationFunction<UpdateUserMutation, UpdateUserMutationVariables>;
export function useUpdateUserMutation(baseOptions?: Apollo.MutationHookOptions<UpdateUserMutation, UpdateUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateUserMutation, UpdateUserMutationVariables>(UpdateUserDocument, options);
      }
export type UpdateUserMutationHookResult = ReturnType<typeof useUpdateUserMutation>;
export type UpdateUserMutationResult = Apollo.MutationResult<UpdateUserMutation>;
export type UpdateUserMutationOptions = Apollo.BaseMutationOptions<UpdateUserMutation, UpdateUserMutationVariables>;