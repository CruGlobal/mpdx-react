import React, { ReactElement } from 'react';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { AccountListTypeEnum, CoachingDetail } from './CoachingDetail';
import {
  LoadAccountListCoachingDetailQuery,
  LoadCoachingDetailQuery,
} from './LoadCoachingDetail.generated';

export default {
  title: 'Coaching/CoachingDetail',
};

const coachingId = 'coaching-id';

export const Default = (): ReactElement => {
  return (
    <GqlMockedProvider<{ LoadCoachingDetail: LoadCoachingDetailQuery }>
      mocks={{
        LoadCoachingDetail: {
          coachingAccountList: {
            name: 'Test',
            currency: 'USD',
          },
        },
      }}
    >
      <CoachingDetail
        accountListId={coachingId}
        accountListType={AccountListTypeEnum.Coaching}
      />
    </GqlMockedProvider>
  );
};

export const AccountListDetail = (): ReactElement => {
  return (
    <GqlMockedProvider<{
      LoadAccountListCoachingDetail: LoadAccountListCoachingDetailQuery;
    }>
      mocks={{
        LoadAccountListCoachingDetail: {
          accountList: {
            name: 'Test Account List',
            currency: 'EUR',
          },
        },
      }}
    >
      <CoachingDetail
        accountListId={coachingId}
        accountListType={AccountListTypeEnum.Own}
      />
    </GqlMockedProvider>
  );
};
