import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, within } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import theme from 'src/theme';
import { StepsList } from './StepsList';

const steps = [
  { title: 'Step 1', complete: true, current: false },
  { title: 'Step 2', complete: false, current: true },
  { title: 'Step 3', complete: false, current: false },
];

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <TestRouter>
      <StepsList steps={steps} />
    </TestRouter>
  </ThemeProvider>
);

describe('StepsList', () => {
  it('renders steps with correct titles and icons', () => {
    const { getAllByRole } = render(<TestComponent />);

    const steps = getAllByRole('listitem');
    expect(steps).toHaveLength(3);

    const [firstStep, secondStep, thirdStep] = steps;

    expect(firstStep).toHaveTextContent('Step 1');
    expect(
      within(firstStep).getByTestId('CheckCircleIcon'),
    ).toBeInTheDocument();
    expect(firstStep).toHaveStyle({ color: 'success.main' });

    expect(secondStep).toHaveTextContent('Step 2');
    const icon2 = within(secondStep).getByTestId('CircleIcon');
    expect(icon2).toBeInTheDocument();
    expect(icon2).toHaveStyle({ color: 'rgb(5, 105, 155);' });

    expect(thirdStep).toHaveTextContent('Step 3');
    const icon3 = within(thirdStep).getByTestId('RadioButtonUncheckedIcon');
    expect(icon3).toBeInTheDocument();
    expect(icon3).toHaveStyle({ color: 'rgb(56, 63, 67);' });
  });
});
