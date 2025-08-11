import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
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
  it('should render welcome message', () => {
    const { getByText } = render(<TestComponent />);

    expect(
      getByText('Welcome to the MPD Goal Calculator.'),
    ).toBeInTheDocument();
  });

  it('should render greeting without name', () => {
    const { getByTestId } = render(<TestComponent />);

    const greeting = getByTestId('greeting-typography');
    expect(greeting).toBeInTheDocument();
    expect(
      ['Good Morning,', 'Good Afternoon,', 'Good Evening,'].some(
        (text) => greeting.textContent === text,
      ),
    ).toBe(true);
  });

  it('should render greeting with name when provided', () => {
    const { getByTestId } = render(<TestComponent firstName="John" />);
    const greeting = getByTestId('greeting-typography');
    expect(
      [
        'Good Morning, John.',
        'Good Afternoon, John.',
        'Good Evening, John.',
      ].some((text) => greeting.textContent === text),
    ).toBe(true);
  });
});
