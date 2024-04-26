import * as Types from '../../../../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import { ContactMailingFragmentDoc } from '../../../Mailing/ContactMailing.generated';
import { ContactPersonFragmentDoc } from '../../ContactPeople.generated';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type UpdateContactDetailsMutationVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  attributes: Types.ContactUpdateInput;
}>;

export type UpdateContactDetailsMutation = { __typename?: 'Mutation' } & {
  updateContact?: Types.Maybe<
    { __typename?: 'ContactUpdateMutationPayload' } & {
      contact: { __typename?: 'Contact' } & Pick<
        Types.Contact,
        'id' | 'name' | 'greeting' | 'envelopeGreeting' | 'sendNewsletter'
      > & {
          primaryPerson?: Types.Maybe<
            { __typename?: 'Person' } & Pick<
              Types.Person,
              'id' | 'firstName' | 'lastName'
            >
          >;
          addresses: { __typename?: 'AddressConnection' } & {
            nodes: Array<
              { __typename?: 'Address' } & Pick<
                Types.Address,
                | 'city'
                | 'country'
                | 'historic'
                | 'id'
                | 'location'
                | 'metroArea'
                | 'postalCode'
                | 'primaryMailingAddress'
                | 'region'
                | 'source'
                | 'state'
                | 'street'
                | 'createdAt'
              > & {
                  sourceDonorAccount?: Types.Maybe<
                    { __typename?: 'DonorAccount' } & Pick<
                      Types.DonorAccount,
                      'accountNumber'
                    >
                  >;
                }
            >;
          };
        };
    }
  >;
};

export type ContactDetailsFragment = { __typename?: 'Contact' } & Pick<
  Types.Contact,
  'id' | 'name' | 'greeting' | 'envelopeGreeting' | 'sendNewsletter'
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
    addresses: { __typename?: 'AddressConnection' } & {
      nodes: Array<
        { __typename?: 'Address' } & Pick<
          Types.Address,
          | 'city'
          | 'country'
          | 'historic'
          | 'id'
          | 'location'
          | 'metroArea'
          | 'postalCode'
          | 'primaryMailingAddress'
          | 'region'
          | 'source'
          | 'state'
          | 'street'
        >
      >;
    };
  };

export const ContactDetailsFragmentDoc = gql`
  fragment ContactDetails on Contact {
    id
    name
    primaryPerson {
      ...ContactPerson
    }
    people(first: 25) {
      nodes {
        ...ContactPerson
      }
    }
    addresses(first: 25) {
      nodes {
        city
        country
        historic
        id
        location
        metroArea
        postalCode
        primaryMailingAddress
        region
        source
        state
        street
      }
    }
    greeting
    envelopeGreeting
    sendNewsletter
  }
  ${ContactPersonFragmentDoc}
`;
export const UpdateContactDetailsDocument = gql`
  mutation UpdateContactDetails(
    $accountListId: ID!
    $attributes: ContactUpdateInput!
  ) {
    updateContact(
      input: { accountListId: $accountListId, attributes: $attributes }
    ) {
      contact {
        id
        name
        primaryPerson {
          id
          firstName
          lastName
        }
        ...ContactMailing
      }
    }
  }
  ${ContactMailingFragmentDoc}
`;
export type UpdateContactDetailsMutationFn = Apollo.MutationFunction<
  UpdateContactDetailsMutation,
  UpdateContactDetailsMutationVariables
>;
export function useUpdateContactDetailsMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateContactDetailsMutation,
    UpdateContactDetailsMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateContactDetailsMutation,
    UpdateContactDetailsMutationVariables
  >(UpdateContactDetailsDocument, options);
}
export type UpdateContactDetailsMutationHookResult = ReturnType<
  typeof useUpdateContactDetailsMutation
>;
export type UpdateContactDetailsMutationResult =
  Apollo.MutationResult<UpdateContactDetailsMutation>;
export type UpdateContactDetailsMutationOptions = Apollo.BaseMutationOptions<
  UpdateContactDetailsMutation,
  UpdateContactDetailsMutationVariables
>;
