import * as Types from '../../../../../graphql/types.generated';

import { gql } from '@apollo/client';
export type ContactOtherFragment = (
  { __typename?: 'Contact' }
  & Pick<Types.Contact, 'id' | 'preferredContactMethod' | 'locale' | 'timezone' | 'churchName' | 'website'>
  & { user?: Types.Maybe<(
    { __typename?: 'UserScopedToAccountList' }
    & Pick<Types.UserScopedToAccountList, 'id' | 'firstName' | 'lastName'>
  )>, contactReferralsToMe: (
    { __typename?: 'ReferralConnection' }
    & { nodes: Array<(
      { __typename?: 'Referral' }
      & Pick<Types.Referral, 'id'>
      & { referredBy: (
        { __typename?: 'Contact' }
        & Pick<Types.Contact, 'id' | 'name'>
      ) }
    )> }
  ) }
);

export const ContactOtherFragmentDoc = gql`
    fragment ContactOther on Contact {
  id
  preferredContactMethod
  locale
  timezone
  churchName
  website
  user {
    id
    firstName
    lastName
  }
  contactReferralsToMe(first: 10) {
    nodes {
      id
      referredBy {
        id
        name
      }
    }
  }
}
    `;