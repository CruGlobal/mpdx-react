import * as Types from '../../../graphql/types.generated';

import { gql } from '@apollo/client';
export type CelebrationItemsFragment = { __typename?: 'Contact' } & {
  people: { __typename?: 'PersonConnection' } & {
    nodes: Array<
      { __typename?: 'Person' } & Pick<
        Types.Person,
        'anniversaryMonth' | 'anniversaryDay' | 'birthdayDay' | 'birthdayMonth'
      >
    >;
  };
};

export const CelebrationItemsFragmentDoc = gql`
  fragment CelebrationItems on Contact {
    people(first: 25) {
      nodes {
        anniversaryMonth
        anniversaryDay
        birthdayDay
        birthdayMonth
      }
    }
  }
`;
