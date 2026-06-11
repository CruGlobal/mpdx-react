import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { beforeTestResizeObserver } from '__tests__/util/windowResizeObserver';
import {
  GoalCalculatorTestWrapper,
  goalCalculationMock,
} from '../../../GoalCalculatorTestWrapper';
import { GoalCalculationQuery } from '../../../Shared/GoalCalculation.generated';
import { GetAccountListQuery } from './GetAccountList.generated';
import { PresentingYourGoal } from './PresentingYourGoal';

/*
 * Mocking recharts ResponsiveContainer to avoid ResponsiveContainer
 * width and height issue
 * https://jskim1991.medium.com/react-writing-tests-with-graphs-9b7f2c9eeefc
 */
jest.mock('recharts', () => {
  const OriginalModule = jest.requireActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }) => (
      <OriginalModule.ResponsiveContainer width={800} height={800}>
        {children}
      </OriginalModule.ResponsiveContainer>
    ),
  };
});

const TestComponent: React.FC = () => (
  <GoalCalculatorTestWrapper>
    <GqlMockedProvider<{
      GoalCalculation: GoalCalculationQuery;
      GetAccountList: GetAccountListQuery;
    }>
      mocks={{
        GoalCalculation: {
          goalCalculation: goalCalculationMock,
        },
        GetAccountList: {
          accountList: {
            receivedPledges: 100,
          },
        },
      }}
    >
      <PresentingYourGoal supportRaised={1000} />
    </GqlMockedProvider>
  </GoalCalculatorTestWrapper>
);

describe('PresentingYourGoal', () => {
  beforeEach(() => {
    beforeTestResizeObserver();
  });

  it('renders the presentation cards with goal calculation data', async () => {
    const { getByRole, findByRole, getAllByTestId } = render(
      <TestComponent />,
    );

    expect(
      getByRole('heading', { name: 'Personal Information' }),
    ).toBeInTheDocument();
    expect(
      getByRole('heading', { name: 'Monthly Support Needs' }),
    ).toBeInTheDocument();
    expect(
      getByRole('heading', { name: 'Monthly Support Breakdown' }),
    ).toBeInTheDocument();

    expect(
      await findByRole('cell', { name: 'John and Jane Doe' }),
    ).toBeInTheDocument();
    expect(
      getByRole('cell', { name: 'University of Central Florida' }),
    ).toBeInTheDocument();
    expect(getAllByTestId('amount-typography').length).toBeGreaterThan(0);
  });

  it('renders the support breakdown chart', async () => {
    const { container } = render(<TestComponent />);

    await waitFor(() =>
      expect(container.querySelector('.recharts-pie')).toBeInTheDocument(),
    );
  });
});
