import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  LandingTestWrapper,
  LandingTestWrapperProps,
} from './LandingTestWrapper';
import { NewSalaryCalculatorLanding } from './NewSalaryCalculatorLanding';

const mutationSpy = jest.fn();

const TestComponent: React.FC<LandingTestWrapperProps> = (props) => (
  <LandingTestWrapper {...props} onCall={mutationSpy}>
    <NewSalaryCalculatorLanding />
  </LandingTestWrapper>
);

describe('NewSalaryCalculatorLanding', () => {
  it('renders main heading', async () => {
    const { findByRole } = render(<TestComponent />);
    expect(
      await findByRole('heading', { name: 'Salary Calculation Form' }),
    ).toBeInTheDocument();
  });

  it('renders NameDisplay contents', async () => {
    const { findByRole, findByTestId } = render(<TestComponent />);
    expect(
      await findByRole('heading', { name: 'Doe, John and Jane' }),
    ).toBeInTheDocument();

    expect(await findByTestId('person-numbers')).toHaveTextContent('111111111');
    expect(await findByTestId('amount-one')).toHaveTextContent('$55,000.00');
    expect(await findByTestId('amount-two')).toHaveTextContent('$10,000.00');
  });

  it('renders table with correct cell data', async () => {
    const { getByRole } = render(<TestComponent hasApprovedCalculation />);

    await waitFor(() =>
      expect(getByRole('table')).toHaveTableStructure({
        cells: [
          ['Maximum Allowable Salary', '$60,000.00', '$70,000.00'],
          ['Requested Salary', '$50,000.00', '$60,000.00'],
          ['Tax-deferred 403(b) Contribution', '5%', '6%'],
          ['Roth 403(b) Contribution', '12%', '10%'],
          ['Security (SECA/FICA) Status', 'Subject to SECA', 'Subject to SECA'],
          ['Current Gross Salary', '$55,000.00', '$10,000.00'],
          [
            'Current MHA (Included in Current Gross Salary)',
            '$10,000.00View MHA Form',
            '$12,000.00',
          ],
        ],
      }),
    );
  });

  it('swaps effective request fields when the spouse created the request', async () => {
    const { getByRole } = render(
      <TestComponent hasApprovedCalculation hasSpouseApprovedCalculation />,
    );

    await waitFor(() =>
      expect(getByRole('table')).toHaveTableStructure({
        cells: [
          ['Maximum Allowable Salary', '$70,000.00', '$60,000.00'],
          ['Requested Salary', '$60,000.00', '$50,000.00'],
          ['Tax-deferred 403(b) Contribution', '5%', '6%'],
          ['Roth 403(b) Contribution', '12%', '10%'],
          ['Security (SECA/FICA) Status', 'Subject to SECA', 'Subject to SECA'],
          ['Current Gross Salary', '$55,000.00', '$10,000.00'],
          [
            'Current MHA (Included in Current Gross Salary)',
            '$10,000.00View MHA Form',
            '$12,000.00',
          ],
        ],
      }),
    );
  });

  it('renders action button', async () => {
    const { findByRole } = render(<TestComponent />);

    expect(
      await findByRole('button', { name: 'Calculate New Salary' }),
    ).toBeInTheDocument();
  });

  it('does not render action button for ineligible staff', async () => {
    const { queryByRole } = render(
      <TestComponent salaryRequestEligible={false} />,
    );

    await waitFor(() =>
      expect(queryByRole('progressbar')).not.toBeInTheDocument(),
    );

    await waitFor(() => {
      expect(
        queryByRole('button', { name: 'Calculate New Salary' }),
      ).not.toBeInTheDocument();
    });
  });

  it('shows "Continue Salary Calculation" when there is an in-progress calculation', async () => {
    const { findByRole } = render(<TestComponent hasInProgressCalculation />);

    expect(
      await findByRole('link', { name: 'Continue Salary Calculation' }),
    ).toHaveAttribute(
      'href',
      '/accountLists/account-list-1/hrTools/salaryCalculator/in-progress-calc-1',
    );
  });

  it('shows "Calculate New Salary" when there is no in-progress calculation', async () => {
    const { findByRole } = render(<TestComponent hasApprovedCalculation />);

    expect(
      await findByRole('button', { name: 'Calculate New Salary' }),
    ).toBeInTheDocument();
  });

  it('does not create a new calculation when continuing an in-progress calculation', async () => {
    const { findByRole } = render(<TestComponent hasInProgressCalculation />);

    userEvent.click(
      await findByRole('link', {
        name: 'Continue Salary Calculation',
      }),
    );

    expect(mutationSpy).not.toHaveGraphqlOperation(
      'CreateSalaryCalculation',
      {},
    );
  });

  it('creates a new calculation when clicking "Calculate New Salary"', async () => {
    const { findByRole } = render(<TestComponent hasApprovedCalculation />);

    userEvent.click(
      await findByRole('button', {
        name: 'Calculate New Salary',
      }),
    );

    await waitFor(() => {
      expect(mutationSpy).toHaveGraphqlOperation('CreateSalaryCalculation', {
        input: {
          attributes: {},
        },
      });
    });
  });

  it('disables button while mutation is in progress', async () => {
    const { findByRole } = render(<TestComponent hasApprovedCalculation />);

    const button = await findByRole('button', {
      name: 'Calculate New Salary',
    });

    userEvent.click(button);
    await waitFor(() => {
      expect(button).toBeDisabled();
    });
  });
});
