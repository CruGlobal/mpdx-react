import React, { ReactElement } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { CoachingList } from './CoachingList';
import {
  LoadCoachingListDocument,
  LoadCoachingListQuery,
} from './LoadCoachingList.generated';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';

export default {
  title: 'Coaching/CoachingList',
};

export const Defaulst = (): ReactElement => {
  return (
    <GqlMockedProvider<LoadCoachingListQuery>
      mocks={{
        coachingAccountLists: {
          nodes: [...Array(5)].map((_x, _i) => {
            return {
              currency: 'USD',
              primaryAppeal: {
                amountCurrency: 'USD',
              },
            };
          }),
        },
      }}
    >
      <CoachingList />
    </GqlMockedProvider>
  );
};

export const Loading = (): ReactElement => {
  return (
    <MockedProvider
      mocks={[
        {
          request: {
            query: LoadCoachingListDocument,
          },
          result: {},
          delay: 100931731455,
        },
      ]}
    >
      <CoachingList />
    </MockedProvider>
  );
};
