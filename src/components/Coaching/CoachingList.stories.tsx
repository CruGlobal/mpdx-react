import React, { ReactElement } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import result from 'graphql/possibleTypes.generated';
import { delay } from 'lodash';
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
    <GqlMockedProvider<LoadCoachingListQuery>>
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
