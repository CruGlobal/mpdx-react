import React, { useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import {
  afterTestResizeObserver,
  beforeTestResizeObserver,
} from '__tests__/util/windowResizeObserver';
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

interface ContextHelperProps {
  selectedReport: GoalCalculatorReportEnum;
}

const ContextHelper: React.FC<ContextHelperProps> = ({ selectedReport }) => {
  const { handleStepChange, setSelectedReport } = useGoalCalculator();

  useEffect(() => {
    handleStepChange(GoalCalculatorStepEnum.SummaryReport);
    setSelectedReport(selectedReport);
  }, []);

  return null;
};

interface TestComponentProps {
  selectedReport: GoalCalculatorReportEnum;
}

const TestComponent: React.FC<TestComponentProps> = ({ selectedReport }) => (
  <TestRouter>
    <ThemeProvider theme={theme}>
      <SnackbarProvider>
        <GqlMockedProvider>
          <GoalCalculatorProvider>
            <ContextHelper selectedReport={selectedReport} />
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

  afterAll(() => {
    afterTestResizeObserver();
  });

  it('renders MPD Goal report', () => {
    const { getByRole } = render(
      <TestComponent selectedReport={GoalCalculatorReportEnum.MpdGoal} />,
    );

    expect(getByRole('heading', { name: 'MPD Goal' })).toBeInTheDocument();
  });

  it('renders Presenting Your Goal report', () => {
    const { getByRole } = render(
      <TestComponent
        selectedReport={GoalCalculatorReportEnum.PresentingYourGoal}
      />,
    );

    expect(
      getByRole('heading', { name: 'Presenting Your Goal' }),
    ).toBeInTheDocument();
  });
});
