import { render, waitFor } from '@testing-library/react';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { HealthIndicatorWidget } from './HealthIndicatorWidget';
import { HealthIndicatorWidgetQuery } from './HealthIndicatorWidget.generated';

const accountListId = 'account-list-1';
const setShowHealthIndicator = jest.fn();
const setUsingMachineCalculatedGoal = jest.fn();
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
}
const Components = ({
  healthIndicatorData = [],
  showHealthIndicator = true,
  goal = 7000,
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
      showHealthIndicator={showHealthIndicator}
      setShowHealthIndicator={setShowHealthIndicator}
      setUsingMachineCalculatedGoal={setUsingMachineCalculatedGoal}
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

  describe('setUsingMachineCalculatedGoal', () => {
    it('should set to TRUE as machine goal is defined and the same as the monthly goal', async () => {
      const { findByText } = render(
        <Components
          healthIndicatorData={[healthIndicatorScore]}
          goal={healthIndicatorScore.machineCalculatedGoal}
        />,
      );

      expect(await findByText('Ownership')).toBeInTheDocument();
      expect(setUsingMachineCalculatedGoal).toHaveBeenCalledWith(true);
    });

    it('should set to FALSE as machine goal is different than the monthly goal', async () => {
      const { findByText } = render(
        <Components healthIndicatorData={[healthIndicatorScore]} goal={1000} />,
      );

      expect(await findByText('Ownership')).toBeInTheDocument();
      expect(setUsingMachineCalculatedGoal).toHaveBeenCalledWith(false);
    });
    it('should set to FALSE as machine goal is not defined', async () => {
      const { findByText } = render(
        <Components
          healthIndicatorData={[healthIndicatorScore]}
          goal={undefined}
        />,
      );

      expect(await findByText('Ownership')).toBeInTheDocument();
      expect(setUsingMachineCalculatedGoal).toHaveBeenCalledWith(false);
    });
  });
});
