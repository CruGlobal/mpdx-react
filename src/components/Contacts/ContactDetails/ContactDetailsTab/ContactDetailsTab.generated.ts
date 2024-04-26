import * as Types from '../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import { ContactPeopleFragmentDoc } from './People/ContactPeople.generated';
import { ContactOtherFragmentDoc } from './Other/ContactOther.generated';
import { ContactMailingFragmentDoc } from './Mailing/ContactMailing.generated';
import { ContactPartnerAccountsFragmentDoc } from './PartnerAccounts/ContactPartnerAccounts.generated';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ContactDetailsTabQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  contactId: Types.Scalars['ID']['input'];
}>;

export type ContactDetailsTabQuery = { __typename?: 'Query' } & {
  contact: { __typename?: 'Contact' } & Pick<
    Types.Contact,
    | 'id'
    | 'name'
    | 'tagList'
    | 'greeting'
    | 'envelopeGreeting'
    | 'preferredContactMethod'
    | 'locale'
    | 'timezone'
    | 'churchName'
    | 'website'
    | 'sendNewsletter'
  > & {
      user?: Types.Maybe<
        { __typename?: 'UserScopedToAccountList' } & Pick<
          Types.UserScopedToAccountList,
          'firstName' | 'lastName' | 'id'
        >
      >;
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
      contactReferralsToMe: { __typename?: 'ReferralConnection' } & {
        nodes: Array<
          { __typename?: 'Referral' } & Pick<Types.Referral, 'id'> & {
              referredBy: { __typename?: 'Contact' } & Pick<
                Types.Contact,
                'id' | 'name'
              >;
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
      contactDonorAccounts: { __typename?: 'ContactDonorAccountConnection' } & {
        nodes: Array<
          { __typename?: 'ContactDonorAccount' } & Pick<
            Types.ContactDonorAccount,
            'id'
          > & {
              donorAccount: { __typename?: 'DonorAccount' } & Pick<
                Types.DonorAccount,
                'id' | 'displayName' | 'accountNumber'
              > & {
                  organization: { __typename?: 'Organization' } & Pick<
                    Types.Organization,
                    'id' | 'name'
                  >;
                };
            }
        >;
      };
    };
};

export type DeleteContactMutationVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  contactId: Types.Scalars['ID']['input'];
}>;

export type DeleteContactMutation = { __typename?: 'Mutation' } & {
  deleteContact?: Types.Maybe<
    { __typename?: 'ContactDeleteMutationPayload' } & Pick<
      Types.ContactDeleteMutationPayload,
      'id'
    >
  >;
};

export const ContactDetailsTabDocument = gql`
  query ContactDetailsTab($accountListId: ID!, $contactId: ID!) {
    contact(accountListId: $accountListId, id: $contactId) {
      id
      name
      tagList
      user {
        firstName
        lastName
      }
      ...ContactPeople
      ...ContactOther
      ...ContactMailing
      ...ContactPartnerAccounts
    }
  }
  ${ContactPeopleFragmentDoc}
  ${ContactOtherFragmentDoc}
  ${ContactMailingFragmentDoc}
  ${ContactPartnerAccountsFragmentDoc}
`;
export function useContactDetailsTabQuery(
  baseOptions: Apollo.QueryHookOptions<
    ContactDetailsTabQuery,
    ContactDetailsTabQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    ContactDetailsTabQuery,
    ContactDetailsTabQueryVariables
  >(ContactDetailsTabDocument, options);
}
export function useContactDetailsTabLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    ContactDetailsTabQuery,
    ContactDetailsTabQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    ContactDetailsTabQuery,
    ContactDetailsTabQueryVariables
  >(ContactDetailsTabDocument, options);
}
export type ContactDetailsTabQueryHookResult = ReturnType<
  typeof useContactDetailsTabQuery
>;
export type ContactDetailsTabLazyQueryHookResult = ReturnType<
  typeof useContactDetailsTabLazyQuery
>;
export type ContactDetailsTabQueryResult = Apollo.QueryResult<
  ContactDetailsTabQuery,
  ContactDetailsTabQueryVariables
>;
export const DeleteContactDocument = gql`
  mutation DeleteContact($accountListId: ID!, $contactId: ID!) {
    deleteContact(input: { accountListId: $accountListId, id: $contactId }) {
      id
    }
  }
`;
export type DeleteContactMutationFn = Apollo.MutationFunction<
  DeleteContactMutation,
  DeleteContactMutationVariables
>;
export function useDeleteContactMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeleteContactMutation,
    DeleteContactMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    DeleteContactMutation,
    DeleteContactMutationVariables
  >(DeleteContactDocument, options);
}
export type DeleteContactMutationHookResult = ReturnType<
  typeof useDeleteContactMutation
>;
export type DeleteContactMutationResult =
  Apollo.MutationResult<DeleteContactMutation>;
export type DeleteContactMutationOptions = Apollo.BaseMutationOptions<
  DeleteContactMutation,
  DeleteContactMutationVariables
>;
