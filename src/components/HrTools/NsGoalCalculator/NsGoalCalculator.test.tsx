import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  afterTestResizeObserver,
  beforeTestResizeObserver,
} from '__tests__/util/windowResizeObserver';
import { NsGoalCalculator } from './NsGoalCalculator';
import { NsGoalCalculatorTestWrapper } from './NsGoalCalculatorTestWrapper';

const TestComponent: React.FC = () => (
  <NsGoalCalculatorTestWrapper>
    <NsGoalCalculator />
  </NsGoalCalculatorTestWrapper>
);

describe('NsGoalCalculator', () => {
  beforeEach(() => {
    beforeTestResizeObserver();
  });

  afterEach(() => {
    afterTestResizeObserver();
  });

  it('renders the first step by default', () => {
    const { getByRole } = render(<TestComponent />);

    expect(
      getByRole('heading', { name: 'Review Your Calculation' }),
    ).toBeInTheDocument();
  });

  it('navigates between steps via the step list', async () => {
    const { getByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: '2. Presenting Your Goal' }));
    expect(
      getByRole('heading', { name: 'Presenting Your Goal' }),
    ).toBeInTheDocument();

    userEvent.click(getByRole('button', { name: '3. Next Steps' }));
    expect(getByRole('heading', { name: 'Next Steps' })).toBeInTheDocument();
  });

  it('advances to the next step when the continue button is clicked', () => {
    const { getByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: '2. Presenting Your Goal' }));
    expect(
      getByRole('heading', { name: 'Presenting Your Goal' }),
    ).toBeInTheDocument();

    userEvent.click(getByRole('button', { name: 'Continue' }));
    expect(getByRole('heading', { name: 'Next Steps' })).toBeInTheDocument();
  });
});
