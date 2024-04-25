import * as Types from '../../../../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import { ContactPersonFragmentDoc } from '../../ContactPeople.generated';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type UpdatePersonMutationVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  attributes: Types.PersonUpdateInput;
}>;


export type UpdatePersonMutation = (
  { __typename?: 'Mutation' }
  & { updatePerson?: Types.Maybe<(
    { __typename?: 'PersonUpdateMutationPayload' }
    & { person: (
      { __typename?: 'Person' }
      & Pick<Types.Person, 'id' | 'avatar' | 'almaMater' | 'anniversaryDay' | 'anniversaryMonth' | 'anniversaryYear' | 'birthdayDay' | 'birthdayMonth' | 'birthdayYear' | 'deceased' | 'employer' | 'firstName' | 'gender' | 'lastName' | 'legalFirstName' | 'maritalStatus' | 'occupation' | 'optoutEnewsletter' | 'suffix' | 'title'>
      & { emailAddresses: (
        { __typename?: 'EmailAddressConnection' }
        & { nodes: Array<(
          { __typename?: 'EmailAddress' }
          & Pick<Types.EmailAddress, 'id' | 'email' | 'historic' | 'primary' | 'location' | 'source'>
        )> }
      ), facebookAccounts: (
        { __typename?: 'FacebookAccountConnection' }
        & { nodes: Array<(
          { __typename?: 'FacebookAccount' }
          & Pick<Types.FacebookAccount, 'id' | 'username'>
        )> }
      ), linkedinAccounts: (
        { __typename?: 'LinkedinAccountConnection' }
        & { nodes: Array<(
          { __typename?: 'LinkedinAccount' }
          & Pick<Types.LinkedinAccount, 'id' | 'publicUrl'>
        )> }
      ), phoneNumbers: (
        { __typename?: 'PhoneNumberConnection' }
        & { nodes: Array<(
          { __typename?: 'PhoneNumber' }
          & Pick<Types.PhoneNumber, 'id' | 'historic' | 'number' | 'primary' | 'location' | 'source'>
        )> }
      ), primaryEmailAddress?: Types.Maybe<(
        { __typename?: 'EmailAddress' }
        & Pick<Types.EmailAddress, 'id' | 'email' | 'primary' | 'location' | 'source'>
      )>, primaryPhoneNumber?: Types.Maybe<(
        { __typename?: 'PhoneNumber' }
        & Pick<Types.PhoneNumber, 'id' | 'number' | 'primary' | 'location' | 'source'>
      )>, twitterAccounts: (
        { __typename?: 'TwitterAccountConnection' }
        & { nodes: Array<(
          { __typename?: 'TwitterAccount' }
          & Pick<Types.TwitterAccount, 'id' | 'screenName'>
        )> }
      ), websites: (
        { __typename?: 'WebsiteConnection' }
        & { nodes: Array<(
          { __typename?: 'Website' }
          & Pick<Types.Website, 'id' | 'url'>
        )> }
      ) }
    ) }
  )> }
);

export type CreatePersonMutationVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  attributes: Types.PersonCreateInput;
}>;


export type CreatePersonMutation = (
  { __typename?: 'Mutation' }
  & { createPerson?: Types.Maybe<(
    { __typename?: 'PersonCreateMutationPayload' }
    & { person: (
      { __typename?: 'Person' }
      & Pick<Types.Person, 'id' | 'avatar' | 'almaMater' | 'anniversaryDay' | 'anniversaryMonth' | 'anniversaryYear' | 'birthdayDay' | 'birthdayMonth' | 'birthdayYear' | 'deceased' | 'employer' | 'firstName' | 'gender' | 'lastName' | 'legalFirstName' | 'maritalStatus' | 'occupation' | 'optoutEnewsletter' | 'suffix' | 'title'>
      & { emailAddresses: (
        { __typename?: 'EmailAddressConnection' }
        & { nodes: Array<(
          { __typename?: 'EmailAddress' }
          & Pick<Types.EmailAddress, 'id' | 'email' | 'historic' | 'primary' | 'location' | 'source'>
        )> }
      ), facebookAccounts: (
        { __typename?: 'FacebookAccountConnection' }
        & { nodes: Array<(
          { __typename?: 'FacebookAccount' }
          & Pick<Types.FacebookAccount, 'id' | 'username'>
        )> }
      ), linkedinAccounts: (
        { __typename?: 'LinkedinAccountConnection' }
        & { nodes: Array<(
          { __typename?: 'LinkedinAccount' }
          & Pick<Types.LinkedinAccount, 'id' | 'publicUrl'>
        )> }
      ), phoneNumbers: (
        { __typename?: 'PhoneNumberConnection' }
        & { nodes: Array<(
          { __typename?: 'PhoneNumber' }
          & Pick<Types.PhoneNumber, 'id' | 'historic' | 'number' | 'primary' | 'location' | 'source'>
        )> }
      ), primaryEmailAddress?: Types.Maybe<(
        { __typename?: 'EmailAddress' }
        & Pick<Types.EmailAddress, 'id' | 'email' | 'primary' | 'location' | 'source'>
      )>, primaryPhoneNumber?: Types.Maybe<(
        { __typename?: 'PhoneNumber' }
        & Pick<Types.PhoneNumber, 'id' | 'number' | 'primary' | 'location' | 'source'>
      )>, twitterAccounts: (
        { __typename?: 'TwitterAccountConnection' }
        & { nodes: Array<(
          { __typename?: 'TwitterAccount' }
          & Pick<Types.TwitterAccount, 'id' | 'screenName'>
        )> }
      ), websites: (
        { __typename?: 'WebsiteConnection' }
        & { nodes: Array<(
          { __typename?: 'Website' }
          & Pick<Types.Website, 'id' | 'url'>
        )> }
      ) }
    ) }
  )> }
);

export type DeletePersonMutationVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  id: Types.Scalars['ID']['input'];
}>;


export type DeletePersonMutation = (
  { __typename?: 'Mutation' }
  & { deletePerson?: Types.Maybe<(
    { __typename?: 'PersonDeleteMutationPayload' }
    & Pick<Types.PersonDeleteMutationPayload, 'id'>
  )> }
);


export const UpdatePersonDocument = gql`
    mutation UpdatePerson($accountListId: ID!, $attributes: PersonUpdateInput!) {
  updatePerson(input: {accountListId: $accountListId, attributes: $attributes}) {
    person {
      ...ContactPerson
    }
  }
}
    ${ContactPersonFragmentDoc}`;
export type UpdatePersonMutationFn = Apollo.MutationFunction<UpdatePersonMutation, UpdatePersonMutationVariables>;
export function useUpdatePersonMutation(baseOptions?: Apollo.MutationHookOptions<UpdatePersonMutation, UpdatePersonMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdatePersonMutation, UpdatePersonMutationVariables>(UpdatePersonDocument, options);
      }
export type UpdatePersonMutationHookResult = ReturnType<typeof useUpdatePersonMutation>;
export type UpdatePersonMutationResult = Apollo.MutationResult<UpdatePersonMutation>;
export type UpdatePersonMutationOptions = Apollo.BaseMutationOptions<UpdatePersonMutation, UpdatePersonMutationVariables>;
export const CreatePersonDocument = gql`
    mutation CreatePerson($accountListId: ID!, $attributes: PersonCreateInput!) {
  createPerson(input: {accountListId: $accountListId, attributes: $attributes}) {
    person {
      ...ContactPerson
    }
  }
}
    ${ContactPersonFragmentDoc}`;
export type CreatePersonMutationFn = Apollo.MutationFunction<CreatePersonMutation, CreatePersonMutationVariables>;
export function useCreatePersonMutation(baseOptions?: Apollo.MutationHookOptions<CreatePersonMutation, CreatePersonMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreatePersonMutation, CreatePersonMutationVariables>(CreatePersonDocument, options);
      }
export type CreatePersonMutationHookResult = ReturnType<typeof useCreatePersonMutation>;
export type CreatePersonMutationResult = Apollo.MutationResult<CreatePersonMutation>;
export type CreatePersonMutationOptions = Apollo.BaseMutationOptions<CreatePersonMutation, CreatePersonMutationVariables>;
export const DeletePersonDocument = gql`
    mutation DeletePerson($accountListId: ID!, $id: ID!) {
  deletePerson(input: {accountListId: $accountListId, id: $id}) {
    id
  }
}
    `;
export type DeletePersonMutationFn = Apollo.MutationFunction<DeletePersonMutation, DeletePersonMutationVariables>;
export function useDeletePersonMutation(baseOptions?: Apollo.MutationHookOptions<DeletePersonMutation, DeletePersonMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeletePersonMutation, DeletePersonMutationVariables>(DeletePersonDocument, options);
      }
export type DeletePersonMutationHookResult = ReturnType<typeof useDeletePersonMutation>;
export type DeletePersonMutationResult = Apollo.MutationResult<DeletePersonMutation>;
export type DeletePersonMutationOptions = Apollo.BaseMutationOptions<DeletePersonMutation, DeletePersonMutationVariables>;