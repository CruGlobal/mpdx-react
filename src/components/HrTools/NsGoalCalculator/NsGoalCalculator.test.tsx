import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  afterTestResizeObserver,
  beforeTestResizeObserver,
} from '__tests__/util/windowResizeObserver';
import { NsGoalCalculator } from './NsGoalCalculator';
import { NsGoalCalculatorTestWrapper } from './NsGoalCalculatorTestWrapper';
import { NsGoalCalculatorLayout } from './Shared/NsGoalCalculatorLayout';

const TestComponent: React.FC = () => (
  <NsGoalCalculatorTestWrapper>
    <NsGoalCalculatorLayout mainContent={<NsGoalCalculator />} />
  </NsGoalCalculatorTestWrapper>
);

describe('NsGoalCalculator', () => {
  beforeEach(() => {
    beforeTestResizeObserver();
  });

  afterEach(() => {
    afterTestResizeObserver();
  });

  it('renders the first step by default', async () => {
    const { findByRole } = render(<TestComponent />);

    expect(
      await findByRole('heading', { name: 'Review Your Calculation' }),
    ).toBeInTheDocument();
  });

  it('navigates between steps via the step list', async () => {
    const { findByRole, getByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: '2. Presenting Your Goal' }));
    expect(
      await findByRole('heading', { name: 'Presenting Your Goal' }),
    ).toBeInTheDocument();

    userEvent.click(getByRole('button', { name: '3. Next Steps' }));
    expect(
      await findByRole('heading', { name: 'Next Steps' }),
    ).toBeInTheDocument();
  });

  it('advances to the next step when the continue button is clicked', async () => {
    const { findByRole, getByRole } = render(<TestComponent />);

    expect(
      await findByRole('heading', { name: 'Review Your Calculation' }),
    ).toBeInTheDocument();

    userEvent.click(getByRole('button', { name: '2. Presenting Your Goal' }));
    expect(
      await findByRole('heading', { name: 'Presenting Your Goal' }),
    ).toBeInTheDocument();

    userEvent.click(getByRole('button', { name: 'Continue' }));
    expect(
      await findByRole('heading', { name: 'Next Steps' }),
    ).toBeInTheDocument();
  });

  it('renders a loading skeleton before the calculation resolves', async () => {
    const { container, findByRole, queryByRole } = render(<TestComponent />);

    // While loading: the skeleton shows and the step content is not yet rendered.
    expect(container.querySelector('.MuiSkeleton-root')).toBeInTheDocument();
    expect(
      queryByRole('heading', { name: 'Review Your Calculation' }),
    ).not.toBeInTheDocument();

    // Once the query resolves, the step content replaces the skeleton.
    expect(
      await findByRole('heading', { name: 'Review Your Calculation' }),
    ).toBeInTheDocument();
  });

  it('shows a message when no goal calculation exists', async () => {
    const { findByText } = render(
      <NsGoalCalculatorTestWrapper
        goalCalculationMock={{ newStaffGoalCalculation: null }}
      >
        <NsGoalCalculator />
      </NsGoalCalculatorTestWrapper>,
    );

    expect(
      await findByText(
        'No new staff goal calculation exists for this account.',
      ),
    ).toBeInTheDocument();
  });

  it('shows an error message when the calculation query fails', async () => {
    const { findByRole } = render(
      <NsGoalCalculatorTestWrapper
        goalCalculationMock={{
          newStaffGoalCalculation: () => {
            throw new Error('Failed to load calculation');
          },
        }}
      >
        <NsGoalCalculator />
      </NsGoalCalculatorTestWrapper>,
    );

    expect(await findByRole('alert')).toHaveTextContent(
      'Failed to load calculation',
    );
  });
});
