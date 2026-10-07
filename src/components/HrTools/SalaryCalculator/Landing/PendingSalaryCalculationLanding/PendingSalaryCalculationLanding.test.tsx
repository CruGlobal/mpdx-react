import React from 'react';
import { render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
      '/accountLists/account-list-1/hrTools/salaryCalculator/pending-calc-1?mode=view&print=true',
    );
  });

  describe('when HCM is unavailable', () => {
    it('shows the heavy load alert instead of the request details', async () => {
      const { findByRole, queryByRole } = render(
        <LandingTestWrapper hasLatestCalculation hcmUnavailableCalls={Infinity}>
          <PendingSalaryCalculationLanding />
        </LandingTestWrapper>,
      );

      expect(await findByRole('alert')).toHaveTextContent(
        'The system is currently under heavy load. Please try again in a few minutes.',
      );
      expect(
        queryByRole('heading', { name: 'Current Salary Information' }),
      ).not.toBeInTheDocument();
      expect(queryByRole('link', { name: 'Print' })).not.toBeInTheDocument();
    });

    it('loads the request details when Try Again succeeds', async () => {
      const { findByRole, queryByRole } = render(
        <LandingTestWrapper hasLatestCalculation hcmUnavailableCalls={1}>
          <PendingSalaryCalculationLanding />
        </LandingTestWrapper>,
      );

      const alert = await findByRole('alert');
      userEvent.click(within(alert).getByRole('button', { name: 'Try Again' }));

      expect(
        await findByRole('heading', { name: 'Current Salary Information' }),
      ).toBeInTheDocument();
      expect(queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  it('displays SalaryInformationCard', async () => {
    const { findByRole } = render(<TestComponent />);

    expect(
      await findByRole('heading', { name: 'Current Salary Information' }),
    ).toBeInTheDocument();
  });
});
