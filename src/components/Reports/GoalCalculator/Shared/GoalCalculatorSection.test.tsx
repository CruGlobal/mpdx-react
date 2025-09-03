import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import {
  GoalCalculatorProvider,
  useGoalCalculator,
} from './GoalCalculatorContext';
import {
  GoalCalculatorSection,
  GoalCalculatorSectionProps,
} from './GoalCalculatorSection';

const RightPanel: React.FC = () => {
  const { rightPanelContent } = useGoalCalculator();

  return <aside aria-label="Right Panel">{rightPanelContent}</aside>;
};

const TestComponent: React.FC<Partial<GoalCalculatorSectionProps>> = (
  props
) => (
  <TestRouter>
    <ThemeProvider theme={theme}>
      <SnackbarProvider>
        <GqlMockedProvider>
          <GoalCalculatorProvider>
            <RightPanel />
            <GoalCalculatorSection subtitle="Section Subtitle" {...props}>
              Main content
            </GoalCalculatorSection>
          </GoalCalculatorProvider>
        </GqlMockedProvider>
      </SnackbarProvider>
    </ThemeProvider>
  </TestRouter>
);

describe('GoalCalculatorSection', () => {
  it('renders the header with the title and subtitle', () => {
    const { getByRole, getByText } = render(
      <TestComponent title={'Section Title'} />
    );

    expect(getByRole('heading', { name: 'Section Title' })).toBeInTheDocument();
    expect(getByText('Section Subtitle')).toBeInTheDocument();
  });

  it('does not render icon when there is no right panel content', () => {
    const { queryByRole } = render(<TestComponent />);

    expect(
      queryByRole('button', { name: 'Show additional info' })
    ).not.toBeInTheDocument();
  });

  it('renders print button when it is printable', () => {
    const { getByRole } = render(<TestComponent printable />);

    expect(getByRole('button', { name: 'Print' })).toBeInTheDocument();
  });
});
