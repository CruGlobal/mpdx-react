import { NextRouter } from 'next/router';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
  updatedAt: '2025-01-15T10:00:00Z',
  changesRequestedAt: null,
  feedback: null,
  status: SalaryRequestStatusEnum.Pending,
};

const mutationSpy = jest.fn();

const TestComponent = ({
  calculation,
  onCall,
  router,
}: {
  calculation: LatestCalculation;
  onCall?: typeof mutationSpy;
  router?: Partial<NextRouter>;
}) => (
  <LandingTestWrapper hasLatestCalculation onCall={onCall} router={router}>
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

  it('navigates to the salary calculation page when View Request is clicked', async () => {
    const push = jest.fn();

    const { findByRole } = render(
      <TestComponent calculation={mockCalculation} router={{ push }} />,
    );

    userEvent.click(await findByRole('button', { name: 'View Request' }));

    expect(push).toHaveBeenCalledWith(
      '/accountLists/account-list-1/reports/salaryCalculator/1',
    );
  });

  it('navigates to edit mode when View Request is clicked', async () => {
    const push = jest.fn();

    const calculation = {
      ...mockCalculation,
      status: SalaryRequestStatusEnum.ActionRequired,
    };

    const { findByRole } = render(
      <TestComponent calculation={calculation} router={{ push }} />,
    );

    userEvent.click(await findByRole('button', { name: 'Edit Request' }));

    expect(push).toHaveBeenCalledWith(
      expect.objectContaining({
        pathname: '/accountLists/account-list-1/reports/salaryCalculator/1',
        query: expect.objectContaining({
          mode: 'edit',
        }),
      }),
    );
  });
});
