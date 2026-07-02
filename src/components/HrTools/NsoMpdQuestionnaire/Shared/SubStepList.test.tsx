import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import theme from 'src/theme';
import { SubStep, SubStepList } from './SubStepList';

const subSteps: SubStep[] = [
  { id: 'one', title: 'Section One', complete: false },
  { id: 'two', title: 'Section Two', complete: false },
];

interface TestComponentProps {
  subSteps?: SubStep[];
  currentSubStepId?: string;
}

const TestComponent: React.FC<TestComponentProps> = ({
  subSteps: subStepsProp = subSteps,
  currentSubStepId = subSteps[0].id,
}) => (
  <ThemeProvider theme={theme}>
    <SubStepList subSteps={subStepsProp} currentSubStepId={currentSubStepId} />
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

  it('leaves incomplete sub-step dots outlined even when current', () => {
    const { getAllByTestId, queryByTestId } = render(<TestComponent />);

    expect(getAllByTestId('RadioButtonUncheckedIcon')).toHaveLength(2);
    expect(queryByTestId('CircleIcon')).not.toBeInTheDocument();
  });

  it('fills a sub-step dot blue once its data is complete', () => {
    const { getByTestId } = render(
      <TestComponent
        subSteps={[
          { id: 'one', title: 'Section One', complete: true },
          { id: 'two', title: 'Section Two', complete: false },
        ]}
      />,
    );

    expect(getByTestId('CircleIcon')).toBeInTheDocument();
    expect(getByTestId('RadioButtonUncheckedIcon')).toBeInTheDocument();
  });
});
