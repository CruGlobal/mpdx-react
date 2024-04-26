import * as Types from '../../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import { ContactDonationFragmentDoc } from '../ContactDonationsTab.generated';
import { EditDonationModalDonationFragmentDoc } from '../../../../EditDonationModal/EditDonationModal.generated';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ContactDonationsListQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  contactId: Types.Scalars['ID']['input'];
  after?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;

export type ContactDonationsListQuery = { __typename?: 'Query' } & {
  contact: { __typename?: 'Contact' } & Pick<Types.Contact, 'id'> & {
      donations: { __typename?: 'DonationConnection' } & {
        nodes: Array<
          { __typename?: 'Donation' } & Pick<
            Types.Donation,
            | 'id'
            | 'donationDate'
            | 'paymentMethod'
            | 'memo'
            | 'motivation'
            | 'remoteId'
          > & {
              amount: { __typename?: 'Money' } & Pick<
                Types.Money,
                'amount' | 'currency' | 'convertedAmount' | 'convertedCurrency'
              >;
              appeal?: Types.Maybe<
                { __typename?: 'Appeal' } & Pick<Types.Appeal, 'id' | 'name'>
              >;
              appealAmount?: Types.Maybe<
                { __typename?: 'Money' } & Pick<Types.Money, 'amount'>
              >;
              donorAccount: { __typename?: 'DonorAccount' } & Pick<
                Types.DonorAccount,
                'id' | 'displayName'
              > & {
                  contacts: { __typename?: 'ContactConnection' } & {
                    nodes: Array<
                      { __typename?: 'Contact' } & Pick<Types.Contact, 'id'>
                    >;
                  };
                };
              designationAccount: { __typename?: 'DesignationAccount' } & Pick<
                Types.DesignationAccount,
                'id' | 'name'
              >;
            }
        >;
        pageInfo: { __typename?: 'PageInfo' } & Pick<
          Types.PageInfo,
          'endCursor' | 'hasNextPage' | 'hasPreviousPage' | 'startCursor'
        >;
      };
    };
};

export const ContactDonationsListDocument = gql`
  query ContactDonationsList(
    $accountListId: ID!
    $contactId: ID!
    $after: String
  ) {
    contact(accountListId: $accountListId, id: $contactId) {
      id
      donations(first: 13, after: $after) {
        nodes {
          ...ContactDonation
          ...EditDonationModalDonation
        }
        pageInfo {
          endCursor
          hasNextPage
          hasPreviousPage
          startCursor
        }
      }
    }
  }
  ${ContactDonationFragmentDoc}
  ${EditDonationModalDonationFragmentDoc}
`;
export function useContactDonationsListQuery(
  baseOptions: Apollo.QueryHookOptions<
    ContactDonationsListQuery,
    ContactDonationsListQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    ContactDonationsListQuery,
    ContactDonationsListQueryVariables
  >(ContactDonationsListDocument, options);
}
export function useContactDonationsListLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    ContactDonationsListQuery,
    ContactDonationsListQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    ContactDonationsListQuery,
    ContactDonationsListQueryVariables
  >(ContactDonationsListDocument, options);
}
export type ContactDonationsListQueryHookResult = ReturnType<
  typeof useContactDonationsListQuery
>;
export type ContactDonationsListLazyQueryHookResult = ReturnType<
  typeof useContactDonationsListLazyQuery
>;
export type ContactDonationsListQueryResult = Apollo.QueryResult<
  ContactDonationsListQuery,
  ContactDonationsListQueryVariables
>;
