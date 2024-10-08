import { render, waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import { DateTime } from 'luxon';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import {
  afterTestResizeObserver,
  beforeTestResizeObserver,
} from '__tests__/util/windowResizeObserver';
import { MonthlyCommitment } from './MonthlyCommitment';
import {
  GetReportsPledgeHistoriesQuery,
  useGetReportsPledgeHistoriesQuery,
} from './MonthlyCommitment.generated';

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

  it('renders', async () => {
    const { getByText } = render(
      <GqlMockedProvider<GetReportsPledgeHistoriesQuery>
        mocks={{
          GetReportsPledgeHistories: {
            reportPledgeHistories: [...Array(12)].map((x, i) => ({
              startDate: DateTime.local().minus({ month: i }).toISO(),
              endDate: DateTime.local().minus({ month: i }).toISO(),
              received: i * 5,
              pledged: i * 10,
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

    await waitFor(() =>
      expect(getByText('Monthly Commitments')).toBeInTheDocument(),
    );
  });

  it('renders with missing data', async () => {
    const { getByText } = render(
      <GqlMockedProvider<GetReportsPledgeHistoriesQuery>
        mocks={{
          GetReportsPledgeHistories: {
            reportPledgeHistories: [
              {
                startDate: null,
                endDate: null,
                received: null,
                pledged: null,
              },
              {
                startDate: DateTime.local().toISO(),
                endDate: DateTime.local().toISO(),
                received: 100,
                pledged: 200,
              },
            ],
          },
        }}
      >
        <MonthlyCommitment coachingId={coachingId} />
      </GqlMockedProvider>,
    );

    await waitFor(() =>
      expect(getByText('Monthly Commitments')).toBeInTheDocument(),
    );
  });
});
