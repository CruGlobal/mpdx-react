import { renderHook } from '@testing-library/react-hooks';
import React from 'react';
import {
  LoadCoachingDetailQuery,
  useLoadCoachingDetailQuery,
} from './LoadCoachingDetail.generated';
import { CoachingDetail } from './CoachingDetail';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { render } from '__tests__/util/testingLibraryReactMock';

const coachingId = 'coaching-id';
describe('LoadCoachingDetail', () => {
  it('query', async () => {
    const { result, waitForNextUpdate } = renderHook(
      () =>
        useLoadCoachingDetailQuery({ variables: { coachingId: coachingId } }),
      {
        wrapper: GqlMockedProvider,
      },
    );
    await waitForNextUpdate();
    expect(result.current.data?.coachingAccountList.name).toMatchInlineSnapshot(
      `"Jet fighter Vacuum Maze"`,
    );
  });
  it('view', async () => {
    const { findByText } = render(
      <GqlMockedProvider<LoadCoachingDetailQuery>
        mocks={{
          LoadCoachingDetail: {
            coachingAccountList: {
              id: 'coaching-id',
              name: 'John Doe',
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
