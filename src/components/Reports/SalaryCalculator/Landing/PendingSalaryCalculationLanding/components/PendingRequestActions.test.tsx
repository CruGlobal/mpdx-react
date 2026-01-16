import { render } from '@testing-library/react';
import { SalaryRequestStatusEnum } from 'src/graphql/types.generated';
import { LandingTestWrapper } from '../../NewSalaryCalculationLanding/LandingTestWrapper';
import { PendingRequestActions } from './PendingRequestActions';
import type { LandingSalaryCalculationsQuery } from '../../NewSalaryCalculationLanding/LandingSalaryCalculations.generated';

type LatestCalculation = LandingSalaryCalculationsQuery['latestCalculation'];

const mockCalculation: LatestCalculation = {
  id: '1',
  effectiveDate: '2025-02-01',
  location: 'US',
  mhaAmount: null,
  spouseMhaAmount: null,
  salaryCap: null,
  spouseSalaryCap: null,
  salary: null,
  spouseSalary: null,
  phoneNumber: null,
  emailAddress: null,
  submittedAt: '2025-01-15T10:00:00Z',
  changesRequestedAt: null,
  feedback: null,
  status: SalaryRequestStatusEnum.Pending,
};

const TestComponent = ({ calculation }: { calculation: LatestCalculation }) => (
  <LandingTestWrapper hasLatestCalculation>
    <PendingRequestActions calculation={calculation} />
  </LandingTestWrapper>
);

describe('PendingRequestActions', () => {
  it('renders View Request button', () => {
    const { getByRole } = render(
      <TestComponent calculation={mockCalculation} />,
    );

    expect(getByRole('button', { name: 'View Request' })).toBeInTheDocument();
  });

  it('shows Edit Request button when status is ACTION_REQUIRED', () => {
    const { getByRole } = render(
      <TestComponent
        calculation={{
          ...mockCalculation,
          status: SalaryRequestStatusEnum.ActionRequired,
        }}
      />,
    );

    expect(getByRole('button', { name: 'View Request' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Edit Request' })).toBeInTheDocument();
  });

  it('does not show Edit Request button when status is PENDING', () => {
    const { queryByRole } = render(
      <TestComponent calculation={mockCalculation} />,
    );

    expect(
      queryByRole('button', { name: 'Edit Request' }),
    ).not.toBeInTheDocument();
  });
});
