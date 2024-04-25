import * as Types from '../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type UserFragmentFragment = (
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
);

export type GetProfileInfoQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetProfileInfoQuery = (
  { __typename?: 'Query' }
  & { user: (
    { __typename?: 'User' }
    & Pick<Types.User, 'deceased' | 'optoutEnewsletter' | 'lastName' | 'firstName' | 'legalFirstName' | 'title' | 'suffix' | 'id' | 'occupation' | 'employer' | 'anniversaryYear' | 'anniversaryDay' | 'anniversaryMonth' | 'almaMater' | 'maritalStatus' | 'birthdayDay' | 'birthdayMonth' | 'birthdayYear' | 'gender' | 'avatar'>
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
);

export const UserFragmentFragmentDoc = gql`
    fragment UserFragment on User {
  lastName
  firstName
  legalFirstName
  title
  suffix
  id
  occupation
  employer
  anniversaryYear
  anniversaryDay
  anniversaryMonth
  almaMater
  maritalStatus
  birthdayDay
  birthdayMonth
  birthdayYear
  gender
  avatar
  primaryEmailAddress {
    id
    email
    primary
    location
    source
  }
  primaryPhoneNumber {
    id
    number
    primary
    location
    source
  }
  phoneNumbers {
    nodes {
      id
      number
      primary
      location
      source
      historic
    }
  }
  emailAddresses {
    nodes {
      id
      email
      primary
      location
      source
      historic
    }
  }
  twitterAccounts {
    nodes {
      id
      screenName
    }
  }
  websites {
    nodes {
      url
      id
    }
  }
  linkedinAccounts {
    nodes {
      id
      publicUrl
    }
  }
  facebookAccounts {
    nodes {
      id
      username
    }
  }
}
    `;
export const GetProfileInfoDocument = gql`
    query GetProfileInfo {
  user {
    ...UserFragment
    deceased
    optoutEnewsletter
  }
}
    ${UserFragmentFragmentDoc}`;
export function useGetProfileInfoQuery(baseOptions?: Apollo.QueryHookOptions<GetProfileInfoQuery, GetProfileInfoQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetProfileInfoQuery, GetProfileInfoQueryVariables>(GetProfileInfoDocument, options);
      }
export function useGetProfileInfoLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetProfileInfoQuery, GetProfileInfoQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetProfileInfoQuery, GetProfileInfoQueryVariables>(GetProfileInfoDocument, options);
        }
export type GetProfileInfoQueryHookResult = ReturnType<typeof useGetProfileInfoQuery>;
export type GetProfileInfoLazyQueryHookResult = ReturnType<typeof useGetProfileInfoLazyQuery>;
export type GetProfileInfoQueryResult = Apollo.QueryResult<GetProfileInfoQuery, GetProfileInfoQueryVariables>;