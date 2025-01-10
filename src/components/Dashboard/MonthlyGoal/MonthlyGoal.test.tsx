import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import matchMediaMock from '__tests__/util/matchMediaMock';
import { HealthIndicatorQuery } from './HealthIndicator.generated';
import MonthlyGoal, { MonthlyGoalProps } from './MonthlyGoal';

const accountListId = 'account-list-1';
const defaultProps = {
  goal: 999.5,
  received: 500,
  pledged: 750,
};
const healthIndicatorScore: HealthIndicatorQuery['healthIndicatorData'][0] = {
  id: '1',
  overallHi: 90,
  ownershipHi: 80,
  consistencyHi: 70,
  successHi: 60,
  depthHi: 50,
  machineCalculatedGoal: 7000,
};
const mutationSpy = jest.fn();
interface ComponentsProps {
  healthIndicatorData?: HealthIndicatorQuery['healthIndicatorData'];
  monthlyGoalProps?: Omit<MonthlyGoalProps, 'accountListId'>;
}

const Components = ({
  healthIndicatorData = [],
  monthlyGoalProps,
}: ComponentsProps) => (
  <GqlMockedProvider<{ HealthIndicator: HealthIndicatorQuery }>
    mocks={{
      HealthIndicator: {
        healthIndicatorData,
      },
    }}
    onCall={mutationSpy}
  >
    <MonthlyGoal accountListId={accountListId} {...monthlyGoalProps} />
  </GqlMockedProvider>
);

describe('MonthlyGoal', () => {
  beforeEach(() => {
    matchMediaMock({ width: '1024px' });
  });

  it('default', () => {
    const { getByTestId, queryByTestId } = render(<Components />);

    expect(
      queryByTestId('MonthlyGoalTypographyGoalMobile'),
    ).not.toBeInTheDocument();
    expect(getByTestId('MonthlyGoalTypographyGoal').textContent).toEqual('$0');
    expect(
      getByTestId('MonthlyGoalTypographyReceivedPercentage').textContent,
    ).toEqual('-');
    expect(getByTestId('MonthlyGoalTypographyReceived').textContent).toEqual(
      '$0',
    );
    expect(
      getByTestId('MonthlyGoalTypographyPledgedPercentage').textContent,
    ).toEqual('-');
    expect(getByTestId('MonthlyGoalTypographyPledged').textContent).toEqual(
      '$0',
    );
    expect(
      queryByTestId('MonthlyGoalTypographyBelowGoalPercentage'),
    ).not.toBeInTheDocument();
    expect(
      queryByTestId('MonthlyGoalTypographyBelowGoal'),
    ).not.toBeInTheDocument();
    expect(
      getByTestId('MonthlyGoalTypographyAboveGoalPercentage').textContent,
    ).toEqual('-');
    expect(getByTestId('MonthlyGoalTypographyAboveGoal').textContent).toEqual(
      '-$0',
    );
  });

  it('loading', () => {
    const { getByTestId } = render(
      <Components monthlyGoalProps={{ loading: true }} />,
    );
    expect(
      getByTestId('MonthlyGoalTypographyGoal').children[0].className,
    ).toContain('MuiSkeleton-root');
    expect(
      getByTestId('MonthlyGoalTypographyReceivedPercentage').children[0]
        .className,
    ).toContain('MuiSkeleton-root');
    expect(
      getByTestId('MonthlyGoalTypographyReceived').children[0].className,
    ).toContain('MuiSkeleton-root');
    expect(
      getByTestId('MonthlyGoalTypographyPledgedPercentage').children[0]
        .className,
    ).toContain('MuiSkeleton-root');
    expect(
      getByTestId('MonthlyGoalTypographyPledged').children[0].className,
    ).toContain('MuiSkeleton-root');
    expect(
      getByTestId('MonthlyGoalTypographyAboveGoalPercentage').children[0]
        .className,
    ).toContain('MuiSkeleton-root');
    expect(
      getByTestId('MonthlyGoalTypographyAboveGoal').children[0].className,
    ).toContain('MuiSkeleton-root');
  });

  it('props', () => {
    const { getByTestId, queryByTestId } = render(
      <Components
        monthlyGoalProps={{ ...defaultProps, currencyCode: 'EUR' }}
      />,
    );
    expect(getByTestId('MonthlyGoalTypographyGoal').textContent).toEqual(
      '€999.50',
    );
    expect(
      getByTestId('MonthlyGoalTypographyReceivedPercentage').textContent,
    ).toEqual('50%');
    expect(getByTestId('MonthlyGoalTypographyReceived').textContent).toEqual(
      '€500',
    );
    expect(
      getByTestId('MonthlyGoalTypographyPledgedPercentage').textContent,
    ).toEqual('75%');
    expect(getByTestId('MonthlyGoalTypographyPledged').textContent).toEqual(
      '€750',
    );
    expect(
      getByTestId('MonthlyGoalTypographyBelowGoalPercentage').textContent,
    ).toEqual('25%');
    expect(getByTestId('MonthlyGoalTypographyBelowGoal').textContent).toEqual(
      '€249.50',
    );
    expect(
      queryByTestId('MonthlyGoalTypographyAboveGoalPercentage'),
    ).not.toBeInTheDocument();
    expect(
      queryByTestId('MonthlyGoalTypographyAboveGoal'),
    ).not.toBeInTheDocument();
  });

  it('props above goal', () => {
    const { getByTestId, queryByTestId } = render(
      <Components
        monthlyGoalProps={{
          ...defaultProps,
          received: 5000,
          pledged: 7500,
          currencyCode: 'EUR',
        }}
      />,
    );
    expect(
      getByTestId('MonthlyGoalTypographyReceivedPercentage').textContent,
    ).toEqual('500%');
    expect(
      getByTestId('MonthlyGoalTypographyPledgedPercentage').textContent,
    ).toEqual('750%');
    expect(
      getByTestId('MonthlyGoalTypographyAboveGoalPercentage').textContent,
    ).toEqual('650%');
    expect(getByTestId('MonthlyGoalTypographyAboveGoal').textContent).toEqual(
      '€6,500.50',
    );
    expect(
      queryByTestId('MonthlyGoalTypographyBelowGoalPercentage'),
    ).not.toBeInTheDocument();
    expect(
      queryByTestId('MonthlyGoalTypographyBelowGoal'),
    ).not.toBeInTheDocument();
  });

  describe('mobile', () => {
    beforeEach(() => {
      matchMediaMock({ width: '599px' });
    });

    it('default', () => {
      const { getByTestId, queryByTestId } = render(<Components />);
      expect(
        getByTestId('MonthlyGoalTypographyGoalMobile').textContent,
      ).toEqual('$0');
      expect(
        queryByTestId('MonthlyGoalTypographyGoal'),
      ).not.toBeInTheDocument();
      expect(
        queryByTestId('MonthlyGoalTypographyAboveGoalPercentage'),
      ).not.toBeInTheDocument();
      expect(
        queryByTestId('MonthlyGoalTypographyAboveGoal'),
      ).not.toBeInTheDocument();
    });

    it('props', () => {
      const { getByTestId } = render(
        <Components
          monthlyGoalProps={{ ...defaultProps, currencyCode: 'EUR' }}
        />,
      );
      expect(
        getByTestId('MonthlyGoalTypographyGoalMobile').textContent,
      ).toEqual('€999.50');
    });
  });

  describe('HealthIndicator', () => {
    it('does not render HI widget if no data', async () => {
      const { queryByText } = render(
        <Components monthlyGoalProps={{ ...defaultProps }} />,
      );

      await waitFor(() => {
        expect(mutationSpy).toHaveGraphqlOperation('HealthIndicator');
      });
      expect(queryByText('MPD Health Indicator')).not.toBeInTheDocument();
    });

    it('does not change Grid styles if no data', async () => {
      const { getByTestId } = render(
        <Components monthlyGoalProps={{ ...defaultProps }} />,
      );

      await waitFor(() => {
        expect(mutationSpy).toHaveGraphqlOperation('HealthIndicator');
      });
      expect(getByTestId('containerGrid')).not.toHaveClass(
        'MuiGrid-spacing-xs-2',
      );
      expect(getByTestId('goalGrid')).not.toHaveClass('MuiGrid-grid-xs-6');
    });

    it('should show the health indicator and change Grid styles', async () => {
      const { getByTestId, getByText } = render(
        <Components
          monthlyGoalProps={{ ...defaultProps }}
          healthIndicatorData={[
            {
              id: '1',
              overallHi: 90,
              ownershipHi: 80,
              consistencyHi: 70,
              successHi: 60,
              depthHi: 50,
            },
          ]}
        />,
      );

      await waitFor(() => {
        expect(mutationSpy).toHaveGraphqlOperation('HealthIndicator');
      });
      expect(getByText('MPD Health Indicator')).toBeInTheDocument();
      expect(getByTestId('containerGrid')).toHaveClass('MuiGrid-spacing-xs-2');
      expect(getByTestId('goalGrid')).toHaveClass('MuiGrid-grid-xs-6');
    });
  });

  describe('Monthly Goal', () => {
    it('should set the monthly goal to the user-entered goal if it exists', async () => {
      const { findByRole } = render(
        <Components
          monthlyGoalProps={defaultProps}
          healthIndicatorData={[
            {
              ...healthIndicatorScore,
              machineCalculatedGoal: null,
            },
          ]}
        />,
      );

      expect(
        await findByRole('heading', {
          name: /\$999.50/i,
        }),
      ).toBeInTheDocument();
    });

    it('should set the monthly goal to the machine calculated goal', async () => {
      const { findByRole, queryByRole } = render(
        <Components
          monthlyGoalProps={{ ...defaultProps, goal: undefined }}
          healthIndicatorData={[healthIndicatorScore]}
        />,
      );

      expect(
        await findByRole('heading', {
          name: /\$7,000/i,
        }),
      ).toBeInTheDocument();

      expect(
        queryByRole('heading', {
          name: /\$999.50/i,
        }),
      ).not.toBeInTheDocument();
    });
    it('should set the monthly goal to 0 if both the machineCalculatedGoal and monthly goal are unset', async () => {
      const { findByRole, queryByRole } = render(
        <Components
          monthlyGoalProps={{ ...defaultProps, goal: undefined }}
          healthIndicatorData={[
            {
              ...healthIndicatorScore,
              machineCalculatedGoal: null,
            },
          ]}
        />,
      );

      expect(
        await findByRole('heading', {
          name: /\$0/i,
        }),
      ).toBeInTheDocument();

      expect(
        queryByRole('heading', {
          name: /\$7,000/i,
        }),
      ).not.toBeInTheDocument();

      expect(
        queryByRole('heading', {
          name: /\$999.50/i,
        }),
      ).not.toBeInTheDocument();
    });
  });
});
