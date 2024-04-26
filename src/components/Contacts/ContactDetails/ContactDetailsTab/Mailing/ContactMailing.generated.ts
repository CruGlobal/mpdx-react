import * as Types from '../../../../../graphql/types.generated';

import { gql } from '@apollo/client';
export type ContactMailingFragment = { __typename?: 'Contact' } & Pick<
  Types.Contact,
  'id' | 'name' | 'greeting' | 'envelopeGreeting' | 'sendNewsletter'
> & {
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

export const ContactMailingFragmentDoc = gql`
  fragment ContactMailing on Contact {
    id
    name
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
        sourceDonorAccount {
          accountNumber
        }
        state
        street
        createdAt
      }
    }
    greeting
    envelopeGreeting
    sendNewsletter
  }
`;
