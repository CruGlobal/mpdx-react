import { renderHook } from '@testing-library/react-hooks';
import { useGetReportsPledgeHistoriesQuery } from './MonthlyCommitment.generated';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';

const coachingId = 'coaching-id';
describe('MonthlyCommitment', () => {
  it('query Monthly Commitment', async () => {
    const { result, waitForNextUpdate } = renderHook(
      () =>
        useGetReportsPledgeHistoriesQuery({
          variables: { coachingId: coachingId },
        }),
      {
        wrapper: GqlMockedProvider,
      },
    );
    await waitForNextUpdate();
    expect(
      result.current.data?.reportPledgeHistories?.length,
    ).toMatchInlineSnapshot(`2`);
  });
});
