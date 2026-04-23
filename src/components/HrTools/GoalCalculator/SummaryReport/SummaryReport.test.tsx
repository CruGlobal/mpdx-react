import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { beforeTestResizeObserver } from '__tests__/util/windowResizeObserver';
import theme from 'src/theme';
import {
  GoalCalculatorReportEnum,
  GoalCalculatorStepEnum,
} from '../GoalCalculatorHelper';
import {
  GoalCalculatorProvider,
  useGoalCalculator,
} from '../Shared/GoalCalculatorContext';
import { SummaryReport } from './SummaryReport';

const ContextHelper: React.FC = () => {
  const { handleStepChange, setSelectedReport } = useGoalCalculator();

  const handleReportChange = (report: GoalCalculatorReportEnum) => {
    handleStepChange(GoalCalculatorStepEnum.SummaryReport);
    setSelectedReport(report);
  };

  return (
    <>
      <button
        onClick={() => handleReportChange(GoalCalculatorReportEnum.MpdGoal)}
      >
        MPD Goal
      </button>
      <button
        onClick={() =>
          handleReportChange(GoalCalculatorReportEnum.PresentingYourGoal)
        }
      >
        Presenting Your Goal
      </button>
    </>
  );
};
const TestComponent: React.FC = () => (
  <TestRouter>
    <ThemeProvider theme={theme}>
      <SnackbarProvider>
        <GqlMockedProvider>
          <GoalCalculatorProvider>
            <ContextHelper />
            <SummaryReport />
          </GoalCalculatorProvider>
        </GqlMockedProvider>
      </SnackbarProvider>
    </ThemeProvider>
  </TestRouter>
);

describe('SummaryReport', () => {
  beforeAll(() => {
    beforeTestResizeObserver();
  });

  it('renders MPD Goal report', async () => {
    const { getByRole, findByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: 'MPD Goal' }));
    expect(
      await findByRole('heading', { name: 'MPD Goal' }),
    ).toBeInTheDocument();
  });

  it('renders Presenting Your Goal report', async () => {
    const { getByRole, findByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: 'Presenting Your Goal' }));
    expect(
      await findByRole('heading', {
        name: 'Presenting Your Goal',
      }),
    ).toBeInTheDocument();
  });
});
