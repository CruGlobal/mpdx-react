import React, { ReactElement } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { GqlMockedProvider } from '../../../__tests__/util/graphqlMocking';
import { CoachingList } from './CoachingList';
import {
  LoadCoachingListDocument,
  LoadCoachingListQuery,
} from './LoadCoachingList.generated';

export default {
  title: 'Coaching/CoachingList',
};

export const Defaulst = (): ReactElement => {
  return (
    <GqlMockedProvider<LoadCoachingListQuery>
      mocks={{
        coachingAccountLists: {
          totalCount: 3,
          nodes: [
            { currency: 'USD', primaryAppeal: { amountCurrency: 'EUR' } },
            { currency: 'USD', primaryAppeal: { amountCurrency: 'EUR' } },
            { currency: 'USD', primaryAppeal: { amountCurrency: 'JPN' } },
          ],
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
