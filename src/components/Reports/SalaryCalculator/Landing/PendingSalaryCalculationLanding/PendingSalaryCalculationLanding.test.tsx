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

    expect(
      await findByRole('button', { name: 'Download' }),
    ).toBeInTheDocument();
  });

  it('displays SalaryInformationCard', async () => {
    const { findByRole } = render(<TestComponent />);

    expect(
      await findByRole('heading', { name: 'Current Salary Information' }),
    ).toBeInTheDocument();
  });
});
