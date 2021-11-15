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

export const Default = (): ReactElement => {
  return (
    <GqlMockedProvider<LoadCoachingListQuery>
      mocks={{
        LoadCoachingList: {
          coachingAccountLists: {
            totalCount: 3,
            nodes: [
              { currency: 'USD', primaryAppeal: { amountCurrency: 'EUR' } },
              { currency: 'USD', primaryAppeal: { amountCurrency: 'EUR' } },
              { currency: 'USD', primaryAppeal: { amountCurrency: 'JPY' } },
            ],
          },
          accountList: {
            name: 'Current AccountList',
            currency: 'EUR',
            primaryAppeal: { amountCurrency: 'JPY' },
          },
        },
      }}
    >
      <CoachingList accountListId="account-list-id" />
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
      <CoachingList accountListId="account-list-id" />
    </MockedProvider>
  );
};
