import { render } from '@testing-library/react';
import { HealthIndicatorQuery } from 'src/components/Dashboard/MonthlyGoal/HealthIndicator.generated';
import { HealthIndicatorWidget } from './HealthIndicatorWidget';

const accountListId = 'account-list-1';
const healthIndicatorScore = {
  id: '1',
  overallHi: 90,
  ownershipHi: 80,
  consistencyHi: 70,
  successHi: 60,
  depthHi: 50,
  machineCalculatedGoal: 7000,
};

interface ComponentsProps {
  healthIndicatorData?: HealthIndicatorQuery['healthIndicatorData'][0];
  loading?: boolean;
  onDashboard?: boolean;
}
const Components = ({
  healthIndicatorData = {} as unknown as HealthIndicatorQuery['healthIndicatorData'][0],
  loading = false,
  onDashboard = true,
}: ComponentsProps) => (
  <HealthIndicatorWidget
    accountListId={accountListId}
    onDashboard={onDashboard}
    loading={loading}
    data={healthIndicatorData}
  />
);

describe('HealthIndicatorWidget', () => {
  describe('On Dashboard', () => {
    it('should show the view details button', async () => {
      const { findByRole } = render(
        <Components
          healthIndicatorData={healthIndicatorScore}
          onDashboard={true}
        />,
      );

      expect(
        await findByRole('link', { name: 'View Details' }),
      ).toBeInTheDocument();
    });

    it('should not show view details button if not on dashboard', async () => {
      const { findByText, queryByRole } = render(
        <Components
          healthIndicatorData={healthIndicatorScore}
          onDashboard={false}
        />,
      );

      expect(await findByText('Ownership')).toBeInTheDocument();

      expect(
        queryByRole('button', { name: 'View Details' }),
      ).not.toBeInTheDocument();
    });
  });

  it('renders the data correctly', async () => {
    const { findByText, getByText } = render(
      <Components healthIndicatorData={healthIndicatorScore} />,
    );

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
