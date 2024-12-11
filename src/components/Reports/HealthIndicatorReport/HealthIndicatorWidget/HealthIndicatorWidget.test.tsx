import { render, waitFor } from '@testing-library/react';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { HealthIndicatorWidget } from './HealthIndicatorWidget';
import { HealthIndicatorWidgetQuery } from './HealthIndicatorWidget.generated';

const accountListId = 'account-list-1';
const setShowHealthIndicator = jest.fn();
const mutationSpy = jest.fn();

const healthIndicatorScore = {
  id: '1',
  overallHi: 90,
  ownershipHi: 80,
  consistencyHi: 70,
  successHi: 60,
  depthHi: 50,
};

interface ComponentsProps {
  healthIndicatorData?: HealthIndicatorWidgetQuery['healthIndicatorData'];
  showHealthIndicator?: boolean;
}
const Components = ({
  healthIndicatorData = [],
  showHealthIndicator = true,
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
      showHealthIndicator={showHealthIndicator}
      accountListId={accountListId}
      setShowHealthIndicator={setShowHealthIndicator}
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

  it('renders the most recent data', async () => {
    const { findByText, getByText, queryByText } = render(
      <Components
        healthIndicatorData={[
          healthIndicatorScore,
          { ...healthIndicatorScore, id: '2', overallHi: 20 },
        ]}
      />,
    );

    expect(await findByText('20')).toBeInTheDocument();
    expect(getByText('Overall Health Indicator')).toBeInTheDocument();

    expect(queryByText('90')).not.toBeInTheDocument();
  });
});
