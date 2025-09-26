import React from 'react';
import { render } from '@testing-library/react';
import { GoalCalculatorTestWrapper } from '../../../GoalCalculatorTestWrapper';
import { MpdGoalHeaderCards } from './MpdGoalHeaderCards';

const TestComponent = () => (
  <GoalCalculatorTestWrapper>
    <MpdGoalHeaderCards supportRaisedPercentage={0.8} />
  </GoalCalculatorTestWrapper>
);

// Avoid searching for calculated values in the event that calculations change
describe('MpdGoalHeaderCards', () => {
  it('renders the headings and values', () => {
    const { getByRole } = render(<TestComponent />);
    expect(getByRole('heading', { name: 'Your Goal' })).toBeInTheDocument();
    expect(getByRole('heading', { name: /\$\d/ })).toBeInTheDocument();
    expect(getByRole('heading', { name: 'Progress' })).toBeInTheDocument();
    expect(getByRole('heading', { name: '80%' })).toBeInTheDocument();
  });
});
