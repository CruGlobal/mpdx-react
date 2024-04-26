import * as Types from '../../../../../graphql/types.generated';

import { gql } from '@apollo/client';
export type ContactHeaderEmailFragment = { __typename?: 'Contact' } & Pick<
  Types.Contact,
  'id'
> & {
    primaryPerson?: Types.Maybe<
      { __typename?: 'Person' } & {
        primaryEmailAddress?: Types.Maybe<
          { __typename?: 'EmailAddress' } & Pick<Types.EmailAddress, 'email'>
        >;
      }
    >;
  };

export const ContactHeaderEmailFragmentDoc = gql`
  fragment ContactHeaderEmail on Contact {
    id
    primaryPerson {
      primaryEmailAddress {
        email
      }
    }
  }
`;
