import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import matchMediaMock from '__tests__/util/matchMediaMock';
import theme from 'src/theme';
import { HealthIndicatorQuery } from './HealthIndicator.generated';
import MonthlyGoal, { MonthlyGoalProps } from './MonthlyGoal';

const accountListId = 'account-list-1';

const mutationSpy = jest.fn();
interface ComponentsProps {
  healthIndicatorData?: Partial<
    HealthIndicatorQuery['accountList']['healthIndicatorData']
  >;
  accountList?: Partial<MonthlyGoalProps['accountList']> | null;
}

const Components = ({
  healthIndicatorData = null,
  accountList,
}: ComponentsProps) => (
  <ThemeProvider theme={theme}>
    <GqlMockedProvider<{ HealthIndicator: HealthIndicatorQuery }>
      mocks={{
        HealthIndicator: {
          accountList: {
            healthIndicatorData:
              healthIndicatorData === null
                ? null
                : {
                    machineCalculatedGoalCurrency: 'USD',
                    ...healthIndicatorData,
                  },
          },
        },
      }}
      onCall={mutationSpy}
    >
      <MonthlyGoal
        accountListId={accountListId}
        accountList={
          accountList === null
            ? null
            : {
                currency: 'USD',
                monthlyGoal: 999.5,
                receivedPledges: 500,
                totalPledges: 750,
                ...accountList,
              }
        }
      />
    </GqlMockedProvider>
  </ThemeProvider>
);

describe('MonthlyGoal', () => {
  beforeEach(() => {
    matchMediaMock({ width: '1024px' });
  });

  it('zeros', () => {
    const { getByTestId, queryByTestId } = render(
      <Components
        accountList={{ monthlyGoal: 0, receivedPledges: 0, totalPledges: 0 }}
      />,
    );

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
    const { getByTestId } = render(<Components accountList={null} />);
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
      <Components accountList={{ currency: 'EUR' }} />,
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
        accountList={{
          receivedPledges: 5000,
          totalPledges: 7500,
          currency: 'EUR',
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
      const { getByTestId, queryByTestId } = render(
        <Components accountList={{ monthlyGoal: null }} />,
      );
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
        <Components accountList={{ currency: 'EUR' }} />,
      );
      expect(
        getByTestId('MonthlyGoalTypographyGoalMobile').textContent,
      ).toEqual('€999.50');
    });
  });

  describe('HealthIndicator', () => {
    it('does not render HI widget if no data', async () => {
      const { queryByText } = render(<Components />);

      await waitFor(() => {
        expect(mutationSpy).toHaveGraphqlOperation('HealthIndicator');
      });
      expect(queryByText('MPD Health Indicator')).not.toBeInTheDocument();
    });

    it('does not change Grid styles if no data', async () => {
      const { getByTestId } = render(<Components />);

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
        <Components healthIndicatorData={{}} />,
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
      const { findByLabelText, findByRole, queryByRole } = render(
        <Components healthIndicatorData={{ machineCalculatedGoal: null }} />,
      );

      expect(
        await findByLabelText(
          /^Your current goal of \$999.50 is staff-entered/,
        ),
      ).not.toHaveStyle('color: rgb(169, 68, 66)');

      expect(
        await findByRole('heading', { name: '$999.50' }),
      ).toBeInTheDocument();

      expect(
        queryByRole('link', { name: 'Set Monthly Goal' }),
      ).not.toBeInTheDocument();
    });

    describe('updated date', () => {
      it('is the date that the monthly goal was updated', () => {
        const { getByText } = render(
          <Components
            accountList={{
              monthlyGoal: 5000,
              monthlyGoalUpdatedAt: '2024-01-01T00:00:00Z',
            }}
          />,
        );

        expect(getByText('Last updated Jan 1, 2024')).toBeInTheDocument();
      });

      it('is hidden if the goal is missing', () => {
        const { queryByText } = render(
          <Components
            accountList={{
              monthlyGoal: null,
              monthlyGoalUpdatedAt: '2024-01-01T00:00:00Z',
            }}
          />,
        );

        expect(queryByText('Last updated Jan 1, 2024')).not.toBeInTheDocument();
      });
    });

    describe('below machine-calculated warning', () => {
      it('is shown if goal is less than the machine-calculated goal', async () => {
        const { findByText } = render(
          <Components
            accountList={{ monthlyGoal: 5000 }}
            healthIndicatorData={{ machineCalculatedGoal: 10000 }}
          />,
        );

        expect(
          await findByText('Below NetSuite-calculated goal'),
        ).toBeInTheDocument();
      });

      it('is hidden if goal is greater than or equal to the machine-calculated goal', async () => {
        const { queryByText } = render(
          <Components
            accountList={{ monthlyGoal: 5000 }}
            healthIndicatorData={{ machineCalculatedGoal: 5000 }}
          />,
        );

        await waitFor(() =>
          expect(
            queryByText('Below NetSuite-calculated goal'),
          ).not.toBeInTheDocument(),
        );
      });
    });

    it('should set the monthly goal to the machine-calculated goal', async () => {
      const { findByRole, getByRole, queryByRole, queryByText } = render(
        <Components
          accountList={{ monthlyGoal: null }}
          healthIndicatorData={{ machineCalculatedGoal: 7000 }}
        />,
      );

      expect(
        await findByRole('heading', { name: '$7,000' }),
      ).toBeInTheDocument();

      expect(
        queryByRole('heading', { name: '$999.50' }),
      ).not.toBeInTheDocument();

      expect(queryByText('Last updated Jan 1, 2024')).not.toBeInTheDocument();

      expect(getByRole('link', { name: 'Set Monthly Goal' })).toHaveAttribute(
        'href',
        '/accountLists/account-list-1/settings/preferences?selectedTab=MonthlyGoal',
      );
    });

    it('should set the monthly goal to 0 if both the machineCalculatedGoal and monthly goal are unset', async () => {
      const { findByRole, queryByRole } = render(
        <Components
          accountList={{ monthlyGoal: null }}
          healthIndicatorData={{ machineCalculatedGoal: null }}
        />,
      );

      expect(await findByRole('heading', { name: '$0' })).toBeInTheDocument();

      expect(
        queryByRole('heading', { name: '$7,000' }),
      ).not.toBeInTheDocument();

      expect(
        queryByRole('heading', { name: '$999.50' }),
      ).not.toBeInTheDocument();
    });
  });
});
