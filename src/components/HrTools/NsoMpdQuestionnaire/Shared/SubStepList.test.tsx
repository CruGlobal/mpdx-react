import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import theme from 'src/theme';
import { SubStep, SubStepList } from './SubStepList';

const subSteps: SubStep[] = [
  { id: 'one', title: 'Section One' },
  { id: 'two', title: 'Section Two' },
];

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <SubStepList subSteps={subSteps} currentSubStepId={subSteps[0].id} />
  </ThemeProvider>
);

describe('SubStepList', () => {
  it('renders each sub-step with its position', () => {
    const { getByText } = render(<TestComponent />);

    expect(getByText('1. Section One')).toBeInTheDocument();
    expect(getByText('2. Section Two')).toBeInTheDocument();
  });

  it('marks the current sub-step', () => {
    const { getByText } = render(<TestComponent />);

    expect(getByText('1. Section One').closest('li')).toHaveAttribute(
      'aria-current',
      'step',
    );
    expect(getByText('2. Section Two').closest('li')).not.toHaveAttribute(
      'aria-current',
    );
  });
});
