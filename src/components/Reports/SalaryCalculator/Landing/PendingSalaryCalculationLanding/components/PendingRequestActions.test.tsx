import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SalaryRequestStatusEnum } from 'src/graphql/types.generated';
import { LandingTestWrapper } from '../../NewSalaryCalculationLanding/LandingTestWrapper';
import { PendingRequestActions } from './PendingRequestActions';
import type { LandingSalaryCalculationsQuery } from '../../NewSalaryCalculationLanding/LandingSalaryCalculations.generated';

type LatestCalculation = LandingSalaryCalculationsQuery['latestCalculation'];

const mockCalculation: LatestCalculation = {
  id: '1',
  mhaAmount: null,
  spouseMhaAmount: null,
  salaryCap: null,
  spouseSalaryCap: null,
  salary: null,
  spouseSalary: null,
  submittedAt: '2025-01-15T10:00:00Z',
  changesRequestedAt: null,
  feedback: null,
  status: SalaryRequestStatusEnum.Pending,
};

const mutationSpy = jest.fn();

const TestComponent = ({
  calculation,
  onCall,
}: {
  calculation: LatestCalculation;
  onCall?: typeof mutationSpy;
}) => (
  <LandingTestWrapper hasLatestCalculation onCall={onCall}>
    <PendingRequestActions calculation={calculation} />
  </LandingTestWrapper>
);

describe('PendingRequestActions', () => {
  it('renders View Request link with correct href', () => {
    const { getByRole } = render(
      <TestComponent calculation={mockCalculation} />,
    );

    expect(getByRole('link', { name: 'View Request' })).toHaveAttribute(
      'href',
      '/accountLists/account-list-1/reports/salaryCalculator/1?mode=view',
    );
  });

  it('shows Edit Request link with correct href when status is ACTION_REQUIRED', () => {
    const { getByRole } = render(
      <TestComponent
        calculation={{
          ...mockCalculation,
          status: SalaryRequestStatusEnum.ActionRequired,
        }}
      />,
    );

    expect(getByRole('link', { name: 'Edit Request' })).toHaveAttribute(
      'href',
      '/accountLists/account-list-1/reports/salaryCalculator/1',
    );
  });

  it('does not show Edit Request link when status is PENDING', () => {
    const { queryByRole } = render(
      <TestComponent calculation={mockCalculation} />,
    );

    expect(
      queryByRole('link', { name: 'Edit Request' }),
    ).not.toBeInTheDocument();
  });

  it('enables canceling the salary calculation request', async () => {
    const { findByRole, findByText } = render(
      <TestComponent calculation={mockCalculation} onCall={mutationSpy} />,
    );

    userEvent.click(await findByRole('button', { name: 'Delete request' }));

    userEvent.click(await findByText('Yes, Cancel'));
    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('DeleteSalaryCalculation'),
    );
  });
});
