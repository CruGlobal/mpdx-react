import * as Types from '../../../../../graphql/types.generated';

import { gql } from '@apollo/client';
export type ContactHeaderNewsletterFragment = { __typename?: 'Contact' } & Pick<
  Types.Contact,
  'id' | 'sendNewsletter'
>;

export const ContactHeaderNewsletterFragmentDoc = gql`
  fragment ContactHeaderNewsletter on Contact {
    id
    sendNewsletter
  }
`;
