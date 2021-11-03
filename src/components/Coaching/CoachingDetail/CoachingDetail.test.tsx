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
            },
          },
        }}
      >
        <CoachingDetail coachingId="coaching-id" />
      </GqlMockedProvider>,
    );
    expect(await findByText('John Doe')).toBeVisible();
  });
});
