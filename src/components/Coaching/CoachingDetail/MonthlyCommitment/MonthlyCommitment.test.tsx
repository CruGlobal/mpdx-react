import { render } from '@testing-library/react';
import { DateTime } from 'luxon';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import {
  afterTestResizeObserver,
  beforeTestResizeObserver,
} from '__tests__/util/windowResizeObserver';
import { AccountListTypeEnum } from '../CoachingDetail';
import { MonthlyCommitment, MonthlyCommitmentProps } from './MonthlyCommitment';
import { GetReportsPledgeHistoriesQuery } from './MonthlyCommitment.generated';

const coachingId = 'coaching-id';
const defaultMpdInfo = {
  monthlyGoal: 5000,
  activeMpdStartAt: '2019-01-15',
  activeMpdFinishAt: '2019-04-15',
  activeMpdMonthlyGoal: 1500,
};

interface TestComponentProps {
  missingData?: boolean;
  mpdInfo?: MonthlyCommitmentProps['mpdInfo'];
}

const TestComponent: React.FC<TestComponentProps> = ({
  missingData,
  mpdInfo = defaultMpdInfo,
}) => (
  <GqlMockedProvider<{
    GetReportsPledgeHistories: GetReportsPledgeHistoriesQuery;
  }>
    mocks={{
      GetReportsPledgeHistories: {
        reportPledgeHistories: [...Array(12)].map((x, i) =>
          missingData && i === 0
            ? null
            : {
                startDate: DateTime.local().minus({ month: i }).toISO(),
                endDate: DateTime.local().minus({ month: i }).toISO(),
                received: i * 5,
                pledged: i * 10,
              },
        ),
      },
      MonthlyCommitmentSingleMonth: {
        reportPledgeHistories: jest
          .fn()
          .mockReturnValueOnce([{ pledged: 50, received: 50 }])
          .mockReturnValueOnce([{ pledged: 100, received: 150 }]),
      },
    }}
  >
    <MonthlyCommitment
      coachingId={coachingId}
      accountListType={AccountListTypeEnum.Own}
      currencyCode="USD"
      mpdInfo={mpdInfo}
    />
  </GqlMockedProvider>
);

describe('MonthlyCommitment', () => {
  beforeEach(() => {
    beforeTestResizeObserver();
  });

  afterEach(() => {
    afterTestResizeObserver();
  });

  it('renders', async () => {
    const { findByTestId } = render(<TestComponent missingData />);

    expect(await findByTestId('MonthlyCommitmentSummary')).toHaveTextContent(
      'Monthly Commitment Average: $50 | Monthly Commitment Goal: $500',
    );
  });

  it('renders with missing data', async () => {
    const { findByTestId } = render(<TestComponent missingData />);

    expect(await findByTestId('MonthlyCommitmentSummary')).toHaveTextContent(
      'Monthly Commitment Average: $50 | Monthly Commitment Goal: $500',
    );
  });

  it('renders skeleton when MPD info is loading', () => {
    const { getByTestId } = render(<TestComponent mpdInfo={null} />);

    expect(getByTestId('MonthlyCommitmentSkeleton')).toBeInTheDocument();
  });

  it('renders placeholder when MPD info is missing', async () => {
    const { getByText } = render(<TestComponent mpdInfo={{}} />);

    expect(
      getByText('MPD info not set up on account list'),
    ).toBeInTheDocument();
  });
});
