import React from 'react';
import { render } from '@testing-library/react';
import { LandingTestWrapper } from '../NewSalaryCalculationLanding/LandingTestWrapper';
import { PendingRequestCard } from './PendingRequestCard';

const TestComponent: React.FC = () => (
  <LandingTestWrapper hasLatestCalculation>
    <PendingRequestCard />
  </LandingTestWrapper>
);

describe('PendingRequestCard', () => {
  it('renders card with amount and buttons', async () => {
    const { getByRole, findByRole, getByTestId } = render(<TestComponent />);

    expect(getByTestId('gross-salary-amount')).toBeInTheDocument();
    expect(getByRole('button', { name: 'Download' })).toBeInTheDocument();
    expect(
      await findByRole('link', { name: 'View Request' }),
    ).toBeInTheDocument();
  });
});
