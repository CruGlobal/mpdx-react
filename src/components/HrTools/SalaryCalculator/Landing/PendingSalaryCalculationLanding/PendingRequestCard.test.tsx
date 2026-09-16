import React from 'react';
import { render, waitFor } from '@testing-library/react';
import {
  LandingTestWrapper,
  LandingTestWrapperProps,
} from '../NewSalaryCalculationLanding/LandingTestWrapper';
import { PendingRequestCard } from './PendingRequestCard';

const TestComponent: React.FC<LandingTestWrapperProps> = (props) => (
  <LandingTestWrapper hasLatestCalculation {...props}>
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

  it('renders the requested gross salary, not the current gross salary', async () => {
    const { getByTestId } = render(<TestComponent />);

    await waitFor(() =>
      expect(getByTestId('gross-salary-amount')).toHaveTextContent(
        '$69,714.29',
      ),
    );
  });

  it("renders the spouse's requested gross salary alongside the user's", async () => {
    const { getByTestId, getByText } = render(<TestComponent />);

    await waitFor(() =>
      expect(getByTestId('spouse-gross-salary-amount')).toHaveTextContent(
        '$62,000.00',
      ),
    );
    expect(getByText('John')).toBeInTheDocument();
    expect(getByText('Jane')).toBeInTheDocument();
  });

  it('swaps the amounts when the spouse created the request', async () => {
    const { getByTestId } = render(
      <TestComponent hasSpouseLatestCalculation />,
    );

    await waitFor(() =>
      expect(getByTestId('gross-salary-amount')).toHaveTextContent(
        '$62,000.00',
      ),
    );
    expect(getByTestId('spouse-gross-salary-amount')).toHaveTextContent(
      '$69,714.29',
    );
  });

  it('renders a single amount and no names when there is no spouse', async () => {
    const { getByTestId, queryByTestId, queryByText } = render(
      <TestComponent salaryRequestEligible={false} />,
    );

    await waitFor(() =>
      expect(getByTestId('gross-salary-amount')).toHaveTextContent(
        '$69,714.29',
      ),
    );
    expect(queryByTestId('spouse-gross-salary-amount')).not.toBeInTheDocument();
    expect(queryByText('John')).not.toBeInTheDocument();
  });

  it('renders print link with correct href', async () => {
    const { findByRole } = render(<TestComponent />);

    expect(await findByRole('link', { name: 'Print' })).toHaveAttribute(
      'href',
      '/accountLists/account-list-1/hrTools/salaryCalculator/pending-calc-1?mode=view&print=true',
    );
  });
});
