import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import theme from 'src/theme';
import { MpdGoalStepRightPanel } from './MpdGoalStepRightPanel';

const TestComponent = () => {
  return (
    <ThemeProvider theme={theme}>
      <MpdGoalStepRightPanel />
    </ThemeProvider>
  );
};

describe('MpdGoalStepRightPanel', () => {
  it('renders the resources and table title', () => {
    const { getByRole } = render(<TestComponent />);
    expect(getByRole('heading', { name: 'Resources' })).toBeInTheDocument();
    expect(
      getByRole('heading', { name: 'MPD Goal Calculation Table' }),
    ).toBeInTheDocument();
  });

  it('renders the accordions', () => {
    const { getByTestId } = render(<TestComponent />);
    expect(getByTestId('accordions')).toBeInTheDocument();
  });

  it('renders the MPD Goal Calculation Table text', () => {
    const { getByText } = render(<TestComponent />);
    expect(getByText('MPD Goal Calculation Table')).toBeVisible();
  });
});
