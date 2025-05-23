import { render } from '@testing-library/react';
import { gqlMock } from '__tests__/util/graphqlMocking';
import {
  HealthIndicatorDocument,
  HealthIndicatorQuery,
  HealthIndicatorQueryVariables,
} from 'src/components/Dashboard/MonthlyGoal/HealthIndicator.generated';
import { HealthIndicatorWidget } from './HealthIndicatorWidget';

const accountListId = 'account-list-1';
const healthIndicatorScore = {
  overallHi: 90,
  ownershipHi: 80,
  consistencyHi: 70,
  successHi: 60,
  depthHi: 50,
};

interface ComponentsProps {
  loading?: boolean;
  onDashboard?: boolean;
}

const Components = ({
  loading = false,
  onDashboard = true,
}: ComponentsProps) => {
  const { healthIndicatorData } = gqlMock<
    HealthIndicatorQuery,
    HealthIndicatorQueryVariables
  >(HealthIndicatorDocument, {
    variables: {
      accountListId,
    },
    mocks: {
      accountList: {
        healthIndicatorData: healthIndicatorScore,
      },
    },
  }).accountList;

  return (
    <HealthIndicatorWidget
      accountListId={accountListId}
      onDashboard={onDashboard}
      loading={loading}
      data={healthIndicatorData}
    />
  );
};

describe('HealthIndicatorWidget', () => {
  describe('On Dashboard', () => {
    it('should show the view details button', async () => {
      const { findByRole } = render(<Components onDashboard={true} />);

      expect(
        await findByRole('link', { name: 'View Details' }),
      ).toBeInTheDocument();
    });

    it('should not show view details button if not on dashboard', async () => {
      const { findByText, queryByRole } = render(
        <Components onDashboard={false} />,
      );

      expect(await findByText('Ownership')).toBeInTheDocument();

      expect(
        queryByRole('button', { name: 'View Details' }),
      ).not.toBeInTheDocument();
    });
  });

  it('renders the data correctly', async () => {
    const { findByText, getByText } = render(<Components />);

    expect(await findByText('Ownership')).toBeInTheDocument();
    expect(getByText('MPD Health Indicator')).toBeInTheDocument();

    expect(getByText('90')).toBeInTheDocument();
    expect(getByText('Overall Health Indicator')).toBeInTheDocument();

    expect(getByText('80')).toBeInTheDocument();
    expect(getByText('Ownership')).toBeInTheDocument();

    expect(getByText('70')).toBeInTheDocument();
    expect(getByText('Consistency')).toBeInTheDocument();

    expect(getByText('60')).toBeInTheDocument();
    expect(getByText('Success')).toBeInTheDocument();

    expect(getByText('50')).toBeInTheDocument();
    expect(getByText('Depth')).toBeInTheDocument();
  });
});
