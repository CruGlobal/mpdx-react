import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NsGoalCalculatorTestWrapper } from '../NsGoalCalculatorTestWrapper';
import { NsGoalCalculatorLayout } from './NsGoalCalculatorLayout';

const TestComponent: React.FC = () => (
  <NsGoalCalculatorTestWrapper>
    <NsGoalCalculatorLayout mainContent={<div>Main panel content</div>} />
  </NsGoalCalculatorTestWrapper>
);

describe('NsGoalCalculatorLayout', () => {
  it('renders the sidebar title', () => {
    const { getByRole } = render(<TestComponent />);

    expect(getByRole('heading', { name: 'Your MPD Goal' })).toBeInTheDocument();
  });

  it('labels the steps sidebar', () => {
    const { getByLabelText } = render(<TestComponent />);

    expect(getByLabelText('Steps')).toBeInTheDocument();
  });

  it('renders the step list', () => {
    const { getByRole } = render(<TestComponent />);

    expect(
      getByRole('button', { name: '1. Review Your Calculation' }),
    ).toBeInTheDocument();
  });

  it('renders the main content slot', () => {
    const { getByText } = render(<TestComponent />);

    expect(getByText('Main panel content')).toBeInTheDocument();
  });

  it('collapses and expands the sidebar with the toggle button', () => {
    const { getByLabelText } = render(<TestComponent />);

    const sidebar = getByLabelText('Steps');
    expect(sidebar).toHaveAttribute('aria-expanded', 'true');

    userEvent.click(getByLabelText('Toggle Menu'));
    expect(sidebar).toHaveAttribute('aria-expanded', 'false');

    userEvent.click(getByLabelText('Toggle Menu'));
    expect(sidebar).toHaveAttribute('aria-expanded', 'true');
  });

  it('keeps steps clickable while the sidebar is open', () => {
    const { getByRole } = render(<TestComponent />);

    const step = getByRole('button', { name: '2. Presenting Your Goal' });
    userEvent.click(step);

    expect(step).toHaveAttribute('aria-current', 'step');
  });
});
