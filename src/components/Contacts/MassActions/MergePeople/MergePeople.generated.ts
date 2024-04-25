import * as Types from '../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import { ContactPeopleFragmentDoc } from '../../ContactDetails/ContactDetailsTab/People/ContactPeople.generated';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type MassActionsMergePeopleMutationVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  winnerId: Types.Scalars['ID']['input'];
  loserIds: Array<Types.Scalars['ID']['input']> | Types.Scalars['ID']['input'];
}>;


export type MassActionsMergePeopleMutation = (
  { __typename?: 'Mutation' }
  & { mergePeople?: Types.Maybe<(
    { __typename?: 'MergePeopleMutationPayload' }
    & { contact: (
      { __typename?: 'Contact' }
      & Pick<Types.Contact, 'id' | 'name' | 'greeting' | 'envelopeGreeting'>
      & { primaryPerson?: Types.Maybe<(
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
      )>, people: (
        { __typename?: 'PersonConnection' }
        & { nodes: Array<(
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
        )> }
      ) }
    ) }
  )> }
);


export const MassActionsMergePeopleDocument = gql`
    mutation MassActionsMergePeople($accountListId: ID!, $winnerId: ID!, $loserIds: [ID!]!) {
  mergePeople(
    input: {accountListId: $accountListId, winnerId: $winnerId, loserIds: $loserIds}
  ) {
    contact {
      ...ContactPeople
    }
  }
}
    ${ContactPeopleFragmentDoc}`;
export type MassActionsMergePeopleMutationFn = Apollo.MutationFunction<MassActionsMergePeopleMutation, MassActionsMergePeopleMutationVariables>;
export function useMassActionsMergePeopleMutation(baseOptions?: Apollo.MutationHookOptions<MassActionsMergePeopleMutation, MassActionsMergePeopleMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<MassActionsMergePeopleMutation, MassActionsMergePeopleMutationVariables>(MassActionsMergePeopleDocument, options);
      }
export type MassActionsMergePeopleMutationHookResult = ReturnType<typeof useMassActionsMergePeopleMutation>;
export type MassActionsMergePeopleMutationResult = Apollo.MutationResult<MassActionsMergePeopleMutation>;
export type MassActionsMergePeopleMutationOptions = Apollo.BaseMutationOptions<MassActionsMergePeopleMutation, MassActionsMergePeopleMutationVariables>;