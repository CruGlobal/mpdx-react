import React, { ReactElement } from 'react';
import { LoadCoachingDetailQuery } from './LoadCoachingDetail.generated';
import { CoachingDetail } from './CoachingDetail';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';

export default {
  title: 'Coaching/CoachingDetail',
};

const coachingId = 'coaching-id';

export const Default = (): ReactElement => {
  return (
    <GqlMockedProvider<LoadCoachingDetailQuery>
      mocks={{
        LoadCoachingDetail: {
          coachingAccountList: {
            name: 'Test',
            currency: 'USD',
          },
          accountLists: {
            nodes: [
              {
                name: 'Test',
              },
            ],
          },
        },
      }}
    >
      <CoachingDetail coachingId={coachingId} />
    </GqlMockedProvider>
  );
};
