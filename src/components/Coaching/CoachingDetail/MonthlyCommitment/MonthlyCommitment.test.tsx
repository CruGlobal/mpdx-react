import { renderHook } from '@testing-library/react-hooks';
import {
  GetReportsPledgeHistoriesQuery,
  useGetReportsPledgeHistoriesQuery,
} from './MonthlyCommitment.generated';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { render } from '@testing-library/react';
import { DateTime } from 'luxon';
import { MonthlyCommitment } from './MonthlyCommitment';
import {
  beforeTestResizeObserver,
  afterTestResizeObserver,
} from 'src/utils/tests/windowResizeObserver';

const coachingId = 'coaching-id';
describe('MonthlyCommitment', () => {
  beforeEach(() => {
    beforeTestResizeObserver();
  });

  afterEach(() => {
    afterTestResizeObserver();
  });

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
    ).toMatchInlineSnapshot(`3`);
  });

  it('renders', () => {
    const { getByText } = render(
      <GqlMockedProvider<GetReportsPledgeHistoriesQuery>
        mocks={{
          GetReportsPledgeHistories: {
            reportPledgeHistories: [...Array(12)].map((x, i) => ({
              startDate: DateTime.local().minus({ month: i }).toISO(),
              endDate: DateTime.local().minus({ month: i }).toISO(),
            })),
          },
        }}
      >
        <MonthlyCommitment
          coachingId={coachingId}
          currencyCode="USD"
          goal={2000}
        />
      </GqlMockedProvider>,
    );

    expect(
      getByText('Monthly Commitment Average', { exact: false }),
    ).toBeInTheDocument();
  });
});
