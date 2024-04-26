import * as Types from '../../../../../graphql/types.generated';

import { gql } from '@apollo/client';
export type ContactPeopleFragment = { __typename?: 'Contact' } & Pick<
  Types.Contact,
  'id' | 'name' | 'greeting' | 'envelopeGreeting'
> & {
    primaryPerson?: Types.Maybe<
      { __typename?: 'Person' } & Pick<
        Types.Person,
        | 'id'
        | 'avatar'
        | 'almaMater'
        | 'anniversaryDay'
        | 'anniversaryMonth'
        | 'anniversaryYear'
        | 'birthdayDay'
        | 'birthdayMonth'
        | 'birthdayYear'
        | 'deceased'
        | 'employer'
        | 'firstName'
        | 'gender'
        | 'lastName'
        | 'legalFirstName'
        | 'maritalStatus'
        | 'occupation'
        | 'optoutEnewsletter'
        | 'suffix'
        | 'title'
      > & {
          emailAddresses: { __typename?: 'EmailAddressConnection' } & {
            nodes: Array<
              { __typename?: 'EmailAddress' } & Pick<
                Types.EmailAddress,
                'id' | 'email' | 'historic' | 'primary' | 'location' | 'source'
              >
            >;
          };
          facebookAccounts: { __typename?: 'FacebookAccountConnection' } & {
            nodes: Array<
              { __typename?: 'FacebookAccount' } & Pick<
                Types.FacebookAccount,
                'id' | 'username'
              >
            >;
          };
          linkedinAccounts: { __typename?: 'LinkedinAccountConnection' } & {
            nodes: Array<
              { __typename?: 'LinkedinAccount' } & Pick<
                Types.LinkedinAccount,
                'id' | 'publicUrl'
              >
            >;
          };
          phoneNumbers: { __typename?: 'PhoneNumberConnection' } & {
            nodes: Array<
              { __typename?: 'PhoneNumber' } & Pick<
                Types.PhoneNumber,
                'id' | 'historic' | 'number' | 'primary' | 'location' | 'source'
              >
            >;
          };
          primaryEmailAddress?: Types.Maybe<
            { __typename?: 'EmailAddress' } & Pick<
              Types.EmailAddress,
              'id' | 'email' | 'primary' | 'location' | 'source'
            >
          >;
          primaryPhoneNumber?: Types.Maybe<
            { __typename?: 'PhoneNumber' } & Pick<
              Types.PhoneNumber,
              'id' | 'number' | 'primary' | 'location' | 'source'
            >
          >;
          twitterAccounts: { __typename?: 'TwitterAccountConnection' } & {
            nodes: Array<
              { __typename?: 'TwitterAccount' } & Pick<
                Types.TwitterAccount,
                'id' | 'screenName'
              >
            >;
          };
          websites: { __typename?: 'WebsiteConnection' } & {
            nodes: Array<
              { __typename?: 'Website' } & Pick<Types.Website, 'id' | 'url'>
            >;
          };
        }
    >;
    people: { __typename?: 'PersonConnection' } & {
      nodes: Array<
        { __typename?: 'Person' } & Pick<
          Types.Person,
          | 'id'
          | 'avatar'
          | 'almaMater'
          | 'anniversaryDay'
          | 'anniversaryMonth'
          | 'anniversaryYear'
          | 'birthdayDay'
          | 'birthdayMonth'
          | 'birthdayYear'
          | 'deceased'
          | 'employer'
          | 'firstName'
          | 'gender'
          | 'lastName'
          | 'legalFirstName'
          | 'maritalStatus'
          | 'occupation'
          | 'optoutEnewsletter'
          | 'suffix'
          | 'title'
        > & {
            emailAddresses: { __typename?: 'EmailAddressConnection' } & {
              nodes: Array<
                { __typename?: 'EmailAddress' } & Pick<
                  Types.EmailAddress,
                  | 'id'
                  | 'email'
                  | 'historic'
                  | 'primary'
                  | 'location'
                  | 'source'
                >
              >;
            };
            facebookAccounts: { __typename?: 'FacebookAccountConnection' } & {
              nodes: Array<
                { __typename?: 'FacebookAccount' } & Pick<
                  Types.FacebookAccount,
                  'id' | 'username'
                >
              >;
            };
            linkedinAccounts: { __typename?: 'LinkedinAccountConnection' } & {
              nodes: Array<
                { __typename?: 'LinkedinAccount' } & Pick<
                  Types.LinkedinAccount,
                  'id' | 'publicUrl'
                >
              >;
            };
            phoneNumbers: { __typename?: 'PhoneNumberConnection' } & {
              nodes: Array<
                { __typename?: 'PhoneNumber' } & Pick<
                  Types.PhoneNumber,
                  | 'id'
                  | 'historic'
                  | 'number'
                  | 'primary'
                  | 'location'
                  | 'source'
                >
              >;
            };
            primaryEmailAddress?: Types.Maybe<
              { __typename?: 'EmailAddress' } & Pick<
                Types.EmailAddress,
                'id' | 'email' | 'primary' | 'location' | 'source'
              >
            >;
            primaryPhoneNumber?: Types.Maybe<
              { __typename?: 'PhoneNumber' } & Pick<
                Types.PhoneNumber,
                'id' | 'number' | 'primary' | 'location' | 'source'
              >
            >;
            twitterAccounts: { __typename?: 'TwitterAccountConnection' } & {
              nodes: Array<
                { __typename?: 'TwitterAccount' } & Pick<
                  Types.TwitterAccount,
                  'id' | 'screenName'
                >
              >;
            };
            websites: { __typename?: 'WebsiteConnection' } & {
              nodes: Array<
                { __typename?: 'Website' } & Pick<Types.Website, 'id' | 'url'>
              >;
            };
          }
      >;
    };
  };

export type ContactPersonFragment = { __typename?: 'Person' } & Pick<
  Types.Person,
  | 'id'
  | 'avatar'
  | 'almaMater'
  | 'anniversaryDay'
  | 'anniversaryMonth'
  | 'anniversaryYear'
  | 'birthdayDay'
  | 'birthdayMonth'
  | 'birthdayYear'
  | 'deceased'
  | 'employer'
  | 'firstName'
  | 'gender'
  | 'lastName'
  | 'legalFirstName'
  | 'maritalStatus'
  | 'occupation'
  | 'optoutEnewsletter'
  | 'suffix'
  | 'title'
> & {
    emailAddresses: { __typename?: 'EmailAddressConnection' } & {
      nodes: Array<
        { __typename?: 'EmailAddress' } & Pick<
          Types.EmailAddress,
          'id' | 'email' | 'historic' | 'primary' | 'location' | 'source'
        >
      >;
    };
    facebookAccounts: { __typename?: 'FacebookAccountConnection' } & {
      nodes: Array<
        { __typename?: 'FacebookAccount' } & Pick<
          Types.FacebookAccount,
          'id' | 'username'
        >
      >;
    };
    linkedinAccounts: { __typename?: 'LinkedinAccountConnection' } & {
      nodes: Array<
        { __typename?: 'LinkedinAccount' } & Pick<
          Types.LinkedinAccount,
          'id' | 'publicUrl'
        >
      >;
    };
    phoneNumbers: { __typename?: 'PhoneNumberConnection' } & {
      nodes: Array<
        { __typename?: 'PhoneNumber' } & Pick<
          Types.PhoneNumber,
          'id' | 'historic' | 'number' | 'primary' | 'location' | 'source'
        >
      >;
    };
    primaryEmailAddress?: Types.Maybe<
      { __typename?: 'EmailAddress' } & Pick<
        Types.EmailAddress,
        'id' | 'email' | 'primary' | 'location' | 'source'
      >
    >;
    primaryPhoneNumber?: Types.Maybe<
      { __typename?: 'PhoneNumber' } & Pick<
        Types.PhoneNumber,
        'id' | 'number' | 'primary' | 'location' | 'source'
      >
    >;
    twitterAccounts: { __typename?: 'TwitterAccountConnection' } & {
      nodes: Array<
        { __typename?: 'TwitterAccount' } & Pick<
          Types.TwitterAccount,
          'id' | 'screenName'
        >
      >;
    };
    websites: { __typename?: 'WebsiteConnection' } & {
      nodes: Array<
        { __typename?: 'Website' } & Pick<Types.Website, 'id' | 'url'>
      >;
    };
  };

export const ContactPersonFragmentDoc = gql`
  fragment ContactPerson on Person {
    id
    avatar
    almaMater
    anniversaryDay
    anniversaryMonth
    anniversaryYear
    birthdayDay
    birthdayMonth
    birthdayYear
    deceased
    emailAddresses(first: 25) {
      nodes {
        id
        email
        historic
        primary
        location
        source
      }
    }
    employer
    facebookAccounts(first: 25) {
      nodes {
        id
        username
      }
    }
    firstName
    gender
    lastName
    legalFirstName
    linkedinAccounts(first: 25) {
      nodes {
        id
        publicUrl
      }
    }
    maritalStatus
    occupation
    optoutEnewsletter
    phoneNumbers(first: 25) {
      nodes {
        id
        historic
        number
        primary
        location
        source
      }
    }
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
    suffix
    title
    twitterAccounts(first: 25) {
      nodes {
        id
        screenName
      }
    }
    websites {
      nodes {
        id
        url
      }
    }
  }
`;
export const ContactPeopleFragmentDoc = gql`
  fragment ContactPeople on Contact {
    id
    name
    greeting
    envelopeGreeting
    primaryPerson {
      ...ContactPerson
    }
    people(first: 25) {
      nodes {
        ...ContactPerson
      }
    }
  }
  ${ContactPersonFragmentDoc}
`;
