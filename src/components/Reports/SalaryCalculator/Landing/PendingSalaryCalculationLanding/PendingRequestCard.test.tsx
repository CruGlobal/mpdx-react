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
  it('renders card with amount and view link', async () => {
    const { findByRole, getByTestId } = render(<TestComponent />);

    expect(getByTestId('gross-salary-amount')).toBeInTheDocument();
    expect(
      await findByRole('link', { name: 'View Request' }),
    ).toBeInTheDocument();
  });

  it('renders print link with correct href', async () => {
    const { findByRole } = render(<TestComponent />);

    expect(await findByRole('link', { name: 'Print' })).toHaveAttribute(
      'href',
      '/accountLists/account-list-1/reports/salaryCalculator/pending-calc-1?mode=view&print=true',
    );
  });
});
