import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import theme from 'src/theme';
import { GoalCalculatorProvider } from '../../../Shared/GoalCalculatorContext';
import { PresentingYourGoalStepRightPanel } from './PresentingYourGoalStepRightPanel';

const TestComponent: React.FC = () => (
  <SnackbarProvider>
    <ThemeProvider theme={theme}>
      <GoalCalculatorProvider>
        <PresentingYourGoalStepRightPanel />
      </GoalCalculatorProvider>
    </ThemeProvider>
  </SnackbarProvider>
);

describe('PresentingYourGoalStepRightPanel', () => {
  it('renders the right panel with title and close button', () => {
    const { getByRole } = render(<TestComponent />);
    const closeButton = getByRole('button', { name: 'Close Panel' });
    expect(closeButton).toBeEnabled();

    const heading = getByRole('heading', {
      name: 'Presenting Your Goal Step',
    });
    expect(heading).toBeInTheDocument();
  });
});
