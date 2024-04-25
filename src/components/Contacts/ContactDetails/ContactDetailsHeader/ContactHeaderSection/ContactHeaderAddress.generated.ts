import * as Types from '../../../../../graphql/types.generated';

import { gql } from '@apollo/client';
export type ContactHeaderAddressFragment = (
  { __typename?: 'Contact' }
  & Pick<Types.Contact, 'id' | 'envelopeGreeting' | 'name'>
  & { primaryAddress?: Types.Maybe<(
    { __typename?: 'Address' }
    & Pick<Types.Address, 'id' | 'street' | 'city' | 'state' | 'postalCode' | 'country'>
  )> }
);

export const ContactHeaderAddressFragmentDoc = gql`
    fragment ContactHeaderAddress on Contact {
  id
  envelopeGreeting
  name
  primaryAddress {
    id
    street
    city
    state
    postalCode
    country
  }
}
    `;