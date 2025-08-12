import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { Settings } from 'luxon';
import { SnackbarProvider } from 'notistack';
import theme from 'src/theme';
import { GoalCalculatorProvider } from '../Shared/GoalCalculatorContext';
import { GoalsListWelcome } from './GoalsListWelcome';

const TestComponent: React.FC<{ firstName?: string }> = ({ firstName }) => (
  <SnackbarProvider>
    <ThemeProvider theme={theme}>
      <GoalCalculatorProvider>
        <GoalsListWelcome firstName={firstName} />
      </GoalCalculatorProvider>
    </ThemeProvider>
  </SnackbarProvider>
);

describe('GoalsListWelcome', () => {
  beforeEach(() => {
    Settings.now = () => new Date().setHours(11, 34, 0, 0);
  });

  it('should render welcome message', () => {
    const { getByText } = render(<TestComponent />);

    expect(
      getByText('Welcome to the MPD Goal Calculator.'),
    ).toBeInTheDocument();
  });

  it('should render greeting without name', () => {
    const { getByRole } = render(<TestComponent />);

    expect(getByRole('heading', { name: 'Good Morning,' })).toBeInTheDocument();
  });

  it('should render greeting with name when provided', () => {
    const { getByRole } = render(<TestComponent firstName="John" />);

    expect(
      getByRole('heading', { name: 'Good Morning, John.' }),
    ).toBeInTheDocument();
  });
});
