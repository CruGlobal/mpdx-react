import * as Types from '../../../graphql/types.generated';

import { gql } from '@apollo/client';
import { CelebrationItemsFragmentDoc } from '../CelebrationIcons/CelebrationItems.generated';
export type ContactRowFragment = { __typename?: 'Contact' } & Pick<
  Types.Contact,
  | 'id'
  | 'name'
  | 'status'
  | 'pledgeAmount'
  | 'pledgeFrequency'
  | 'pledgeCurrency'
  | 'pledgeReceived'
  | 'lateAt'
  | 'sendNewsletter'
  | 'starred'
  | 'uncompletedTasksCount'
> & {
    primaryAddress?: Types.Maybe<
      { __typename?: 'Address' } & Pick<
        Types.Address,
        | 'id'
        | 'street'
        | 'city'
        | 'state'
        | 'postalCode'
        | 'country'
        | 'geo'
        | 'source'
        | 'createdAt'
      >
    >;
    people: { __typename?: 'PersonConnection' } & {
      nodes: Array<
        { __typename?: 'Person' } & Pick<
          Types.Person,
          | 'anniversaryMonth'
          | 'anniversaryDay'
          | 'birthdayDay'
          | 'birthdayMonth'
        >
      >;
    };
  };

export const ContactRowFragmentDoc = gql`
  fragment ContactRow on Contact {
    id
    name
    primaryAddress {
      id
      street
      city
      state
      postalCode
      country
      geo
      source
      createdAt
    }
    status
    pledgeAmount
    pledgeFrequency
    pledgeCurrency
    pledgeReceived
    lateAt
    sendNewsletter
    starred
    uncompletedTasksCount
    ...CelebrationItems
  }
  ${CelebrationItemsFragmentDoc}
`;
