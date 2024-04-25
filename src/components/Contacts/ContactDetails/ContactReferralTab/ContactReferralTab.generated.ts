import * as Types from '../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ContactReferralTabQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  contactId: Types.Scalars['ID']['input'];
  after?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type ContactReferralTabQuery = (
  { __typename?: 'Query' }
  & { contact: (
    { __typename?: 'Contact' }
    & Pick<Types.Contact, 'id' | 'name'>
    & { contactReferralsByMe: (
      { __typename?: 'ReferralConnection' }
      & { nodes: Array<(
        { __typename?: 'Referral' }
        & Pick<Types.Referral, 'id' | 'createdAt'>
        & { referredTo: (
          { __typename?: 'Contact' }
          & Pick<Types.Contact, 'id' | 'name'>
        ) }
      )>, pageInfo: (
        { __typename?: 'PageInfo' }
        & Pick<Types.PageInfo, 'endCursor' | 'hasNextPage'>
      ) }
    ) }
  ) }
);

export type ContactReferralFragment = (
  { __typename?: 'Referral' }
  & Pick<Types.Referral, 'id' | 'createdAt'>
  & { referredTo: (
    { __typename?: 'Contact' }
    & Pick<Types.Contact, 'id' | 'name'>
  ) }
);

export const ContactReferralFragmentDoc = gql`
    fragment ContactReferral on Referral {
  id
  createdAt
  referredTo {
    id
    name
  }
}
    `;
export const ContactReferralTabDocument = gql`
    query ContactReferralTab($accountListId: ID!, $contactId: ID!, $after: String) {
  contact(accountListId: $accountListId, id: $contactId) {
    id
    name
    contactReferralsByMe(first: 25, after: $after) {
      nodes {
        ...ContactReferral
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
}
    ${ContactReferralFragmentDoc}`;
export function useContactReferralTabQuery(baseOptions: Apollo.QueryHookOptions<ContactReferralTabQuery, ContactReferralTabQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ContactReferralTabQuery, ContactReferralTabQueryVariables>(ContactReferralTabDocument, options);
      }
export function useContactReferralTabLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ContactReferralTabQuery, ContactReferralTabQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ContactReferralTabQuery, ContactReferralTabQueryVariables>(ContactReferralTabDocument, options);
        }
export type ContactReferralTabQueryHookResult = ReturnType<typeof useContactReferralTabQuery>;
export type ContactReferralTabLazyQueryHookResult = ReturnType<typeof useContactReferralTabLazyQuery>;
export type ContactReferralTabQueryResult = Apollo.QueryResult<ContactReferralTabQuery, ContactReferralTabQueryVariables>;