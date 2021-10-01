import { renderHook } from '@testing-library/react-hooks';
import { useLoadCoachingDetailQuery } from './LoadCoachingDetail.generated';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';

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
});
