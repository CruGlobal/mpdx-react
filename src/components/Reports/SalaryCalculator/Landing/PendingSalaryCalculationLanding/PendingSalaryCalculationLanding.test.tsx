import React from 'react';
import { render } from '@testing-library/react';
import { LandingTestWrapper } from '../NewSalaryCalculationLanding/LandingTestWrapper';
import { PendingSalaryCalculationLanding } from './PendingSalaryCalculationLanding';

const TestComponent: React.FC = () => (
  <LandingTestWrapper hasLatestCalculation>
    <PendingSalaryCalculationLanding />
  </LandingTestWrapper>
);

describe('PendingSalaryCalculationLanding', () => {
  it('renders main content after loading', async () => {
    const { findByRole } = render(<TestComponent />);

    expect(
      await findByRole('heading', { name: 'Your Salary Calculation Form' }),
    ).toBeInTheDocument();
  });

  it('displays NameDisplay with staff info and balances', async () => {
    const { findByRole, getByTestId } = render(<TestComponent />);

    expect(
      await findByRole('heading', { name: 'Your Salary Calculation Form' }),
    ).toBeInTheDocument();

    expect(getByTestId('gross-salary-label')).toBeInTheDocument();
    expect(getByTestId('gross-salary-amount')).toBeInTheDocument();
  });

  it('displays PendingRequestCard', async () => {
    const { findByRole } = render(<TestComponent />);

    expect(await findByRole('link', { name: 'Print' })).toHaveAttribute(
      'href',
      '/accountLists/account-list-1/reports/salaryCalculator/pending-calc-1?mode=view&print=true',
    );
  });

  it('displays SalaryInformationCard', async () => {
    const { findByRole } = render(<TestComponent />);

    expect(
      await findByRole('heading', { name: 'Current Salary Information' }),
    ).toBeInTheDocument();
  });
});
