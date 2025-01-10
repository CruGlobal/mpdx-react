import { render, waitFor } from '@testing-library/react';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { HealthIndicatorWidget } from './HealthIndicatorWidget';
import { HealthIndicatorWidgetQuery } from './HealthIndicatorWidget.generated';

const accountListId = 'account-list-1';
const setShowHealthIndicator = jest.fn();
const setMachineCalculatedGoal = jest.fn();
const mutationSpy = jest.fn();

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
  healthIndicatorData?: HealthIndicatorWidgetQuery['healthIndicatorData'];
  showHealthIndicator?: boolean;
  goal?: number;
  onDashboard?: boolean;
}
const Components = ({
  healthIndicatorData = [],
  showHealthIndicator = true,
  goal = 7000,
  onDashboard = true,
}: ComponentsProps) => (
  <GqlMockedProvider<{ HealthIndicatorWidget: HealthIndicatorWidgetQuery }>
    mocks={{
      HealthIndicatorWidget: {
        healthIndicatorData,
      },
    }}
    onCall={mutationSpy}
  >
    <HealthIndicatorWidget
      accountListId={accountListId}
      goal={goal}
      onDashboard={onDashboard}
      showHealthIndicator={showHealthIndicator}
      setShowHealthIndicator={setShowHealthIndicator}
      setMachineCalculatedGoal={setMachineCalculatedGoal}
    />
  </GqlMockedProvider>
);

describe('HealthIndicatorWidget', () => {
  it('renders nothing when there is no data', async () => {
    const { queryByText, container } = render(
      <Components showHealthIndicator={false} />,
    );

    await waitFor(() => {
      expect(mutationSpy).toHaveGraphqlOperation('HealthIndicatorWidget');
    });

    expect(setShowHealthIndicator).toHaveBeenCalledWith(false);
    expect(container).toBeEmptyDOMElement();
    expect(queryByText('MPD Health Indicator')).not.toBeInTheDocument();
  });

  it('shows the health indicator if data', async () => {
    render(
      <Components
        showHealthIndicator={false}
        healthIndicatorData={[healthIndicatorScore]}
      />,
    );

    await waitFor(() => {
      expect(mutationSpy).toHaveGraphqlOperation('HealthIndicatorWidget');
    });
    expect(setShowHealthIndicator).toHaveBeenCalledWith(true);
  });

  describe('On Dashboard', () => {
    it('should show the view details button', async () => {
      const { findByRole } = render(
        <Components
          healthIndicatorData={[healthIndicatorScore]}
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
          healthIndicatorData={[healthIndicatorScore]}
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
      <Components healthIndicatorData={[healthIndicatorScore]} />,
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

  describe('setMachineCalculatedGoal', () => {
    it('should set to NULL if the user has entered a monthly goal', async () => {
      const { findByText } = render(
        <Components
          healthIndicatorData={[healthIndicatorScore]}
          goal={healthIndicatorScore.machineCalculatedGoal}
        />,
      );

      expect(await findByText('Ownership')).toBeInTheDocument();
      expect(setMachineCalculatedGoal).toHaveBeenCalledWith(null);
    });

    it('should set to 7000 if the monthly goal is not set', async () => {
      const { findByText } = render(
        <Components healthIndicatorData={[healthIndicatorScore]} goal={0} />,
      );

      expect(await findByText('Ownership')).toBeInTheDocument();
      expect(setMachineCalculatedGoal).toHaveBeenCalledWith(7000);
    });
    it('should set to NULL if both the machineCalculatedGoal and monthly goal are not set', async () => {
      const { findByText } = render(
        <Components
          healthIndicatorData={[
            {
              ...healthIndicatorScore,
              machineCalculatedGoal: null,
            },
          ]}
          goal={undefined}
        />,
      );

      expect(await findByText('Ownership')).toBeInTheDocument();
      expect(setMachineCalculatedGoal).toHaveBeenCalledWith(null);
    });
  });
});
