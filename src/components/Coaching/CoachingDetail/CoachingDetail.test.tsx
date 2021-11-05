import React from 'react';
import { LoadCoachingDetailQuery } from './LoadCoachingDetail.generated';
import { CoachingDetail } from './CoachingDetail';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { render } from '__tests__/util/testingLibraryReactMock';

const coachingId = 'coaching-id';
describe('LoadCoachingDetail', () => {
  it('view', async () => {
    const { findByText } = render(
      <GqlMockedProvider<LoadCoachingDetailQuery>
        mocks={{
          LoadCoachingDetail: {
            coachingAccountList: {
              id: coachingId,
              name: 'John Doe',
              currency: 'USD',
              monthlyGoal: 55,
            },
          },
        }}
      >
        <CoachingDetail coachingId="coaching-id" />
      </GqlMockedProvider>,
    );
    expect(await findByText('John Doe')).toBeVisible();
    expect(await findByText('Monthly $55')).toBeVisible();
    expect(await findByText('Monthly Activity')).toBeVisible();
  });
  it('null goal', async () => {
    const { findByText } = render(
      <GqlMockedProvider<LoadCoachingDetailQuery>
        mocks={{
          LoadCoachingDetail: {
            coachingAccountList: {
              id: coachingId,
              name: 'John Doe',
              currency: 'USD',
              monthlyGoal: null,
            },
          },
        }}
      >
        <CoachingDetail coachingId="coaching-id" />
      </GqlMockedProvider>,
    );
    expect(await findByText('John Doe')).toBeVisible();
    expect(await findByText('Monthly $0')).toBeVisible();
    expect(await findByText('Monthly Activity')).toBeVisible();
  });
});
