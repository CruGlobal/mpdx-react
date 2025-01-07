import { render, waitForElementToBeRemoved } from '@testing-library/react';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { HealthIndicatorGraph } from './HealthIndicatorGraph';
import { HealthIndicatorGraphQuery } from './HealthIndicatorGraph.generated';

const accountListId = 'account-list-1';

describe('HealthIndicatorGraph', () => {
  it('renders nothing when there is no data', async () => {
    const { getByTestId, queryByTestId } = render(
      <GqlMockedProvider<{ HealthIndicatorGraph: HealthIndicatorGraphQuery }>
        mocks={{
          HealthIndicatorGraph: {
            healthIndicatorData: [],
          },
        }}
      >
        <HealthIndicatorGraph accountListId={accountListId} />
      </GqlMockedProvider>,
    );

    const skeleton = getByTestId('BarChartSkeleton');
    expect(skeleton).toBeInTheDocument();
    await waitForElementToBeRemoved(skeleton);

    expect(queryByTestId('HealthIndicatorGraphHeader')).not.toBeInTheDocument();
  });

  it('renders a skeleton while data is loading', async () => {
    const { getByTestId } = render(
      <GqlMockedProvider>
        <HealthIndicatorGraph accountListId={accountListId} />
      </GqlMockedProvider>,
    );

    const skeleton = getByTestId('BarChartSkeleton');
    expect(skeleton).toBeInTheDocument();
    await waitForElementToBeRemoved(skeleton);
  });

  it('renders the average', async () => {
    const { findByTestId } = render(
      <GqlMockedProvider<{ HealthIndicatorGraph: HealthIndicatorGraphQuery }>
        mocks={{
          HealthIndicatorGraph: {
            healthIndicatorData: [{ overallHi: 50 }],
          },
        }}
      >
        <HealthIndicatorGraph accountListId={accountListId} />
      </GqlMockedProvider>,
    );

    expect(await findByTestId('HealthIndicatorGraphHeader')).toHaveTextContent(
      'Average 50',
    );
  });
});
