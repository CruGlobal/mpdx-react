import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { beforeTestResizeObserver } from '__tests__/util/windowResizeObserver';
import { GetUserQuery } from 'src/components/User/GetUser.generated';
import theme from 'src/theme';
import { GoalCalculatorProvider } from '../../../Shared/GoalCalculatorContext';
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
  <SnackbarProvider>
    <ThemeProvider theme={theme}>
      <GqlMockedProvider<{
        GetUser: GetUserQuery;
      }>
        mocks={{
          GetUser: {
            user: {
              id: 'user-id-1',
              firstName: 'Obiwan',
              lastName: 'Kenobi',
            },
          },
        }}
      >
        <GoalCalculatorProvider>
          <PresentingYourGoal />
        </GoalCalculatorProvider>
      </GqlMockedProvider>
    </ThemeProvider>
  </SnackbarProvider>
);

describe('PresentingYourGoal', () => {
  beforeEach(() => {
    beforeTestResizeObserver();
  });

  it('renders cell text', () => {
    const { getByRole } = render(<TestComponent />);
    expect(
      getByRole('heading', { name: 'Personal Information' }),
    ).toBeInTheDocument();
    expect(getByRole('cell', { name: 'User' })).toBeInTheDocument();
    expect(getByRole('cell', { name: 'Mission Agency' })).toBeInTheDocument();
    expect(
      getByRole('heading', { name: 'Monthly Support Needs' }),
    ).toBeInTheDocument();

    expect(
      getByRole('heading', { name: 'Monthly Support Breakdown' }),
    ).toBeInTheDocument();
  });

  it("renders the user's name", async () => {
    const { getAllByTestId } = render(<TestComponent />);
    await waitFor(() => {
      const nameElement = getAllByTestId('value-typography').find(
        (element) => element.textContent === 'Obiwan Kenobi',
      );
      expect(nameElement).toBeInTheDocument();
    });
  });

  it('renders the logo image', async () => {
    const { findByRole } = render(<TestComponent />);
    const cruLogo = await findByRole('img');
    expect(cruLogo).toBeInTheDocument();
  });

  it('renders amount elements', () => {
    const { getAllByTestId } = render(<TestComponent />);
    expect(getAllByTestId('amount-typography').length).toBeGreaterThan(0);
  });

  it('renders the pie chart legend', async () => {
    const { container } = render(<TestComponent />);

    const chart = container.querySelector('.recharts-pie');
    expect(chart).toBeInTheDocument();

    const legend = container.querySelector('.recharts-legend-wrapper');
    expect(legend).toBeInTheDocument();
    expect(legend?.textContent).toMatch('Salary');
  });
});
