import * as Types from '../../../../../graphql/types.generated';

import { gql } from '@apollo/client';
export type ContactHeaderPhoneFragment = { __typename?: 'Contact' } & Pick<
  Types.Contact,
  'id'
> & {
    primaryPerson?: Types.Maybe<
      { __typename?: 'Person' } & {
        primaryPhoneNumber?: Types.Maybe<
          { __typename?: 'PhoneNumber' } & Pick<
            Types.PhoneNumber,
            'number' | 'location'
          >
        >;
      }
    >;
  };

export const ContactHeaderPhoneFragmentDoc = gql`
  fragment ContactHeaderPhone on Contact {
    id
    primaryPerson {
      primaryPhoneNumber {
        number
        location
      }
    }
  }
`;
