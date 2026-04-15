import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PdsGoalCalculatorTestWrapper } from '../PdsGoalCalculatorTestWrapper';
import { TotalReimbursableSection } from './TotalReimbursableSection';

interface Props {
  monthlyCellPhone?: number;
  annualConference?: number;
}

const TestComponent: React.FC<Props> = ({
  monthlyCellPhone = 0,
  annualConference = 0,
}) => (
  <PdsGoalCalculatorTestWrapper
    calculationMock={{
      id: 'goal-1',
      ministryCellPhone: monthlyCellPhone,
      ministryInternet: 0,
      mpdNewsletter: 0,
      mpdMiscellaneous: 0,
      accountTransfers: 0,
      otherMonthlyReimbursements: 0,
      conferenceRetreatCosts: annualConference,
      ministryTravelMeals: 0,
      otherAnnualReimbursements: 0,
    }}
  >
    <TotalReimbursableSection />
  </PdsGoalCalculatorTestWrapper>
);

describe('TotalReimbursableSection', () => {
  it('renders the heading', async () => {
    const { findByRole } = render(<TestComponent />);

    expect(
      await findByRole('heading', { name: 'Total Reimbursable Expenses' }),
    ).toBeInTheDocument();
  });

  it('renders the info icon with an accessible label', async () => {
    const { findByLabelText } = render(<TestComponent />);

    expect(
      await findByLabelText('Total reimbursable information'),
    ).toBeInTheDocument();
  });

  it('shows a tooltip describing the $300 minimum floor on hover', async () => {
    const { findByLabelText, findByRole } = render(<TestComponent />);

    userEvent.hover(await findByLabelText('Total reimbursable information'));

    expect(await findByRole('tooltip')).toHaveTextContent(
      'The total is the greater of the $300 minimum or your calculated amount.',
    );
  });

  it('applies the $300 floor when the calculated amount is below it', async () => {
    const { getByTestId } = render(
      <TestComponent monthlyCellPhone={100} annualConference={0} />,
    );

    await waitFor(() =>
      expect(getByTestId('reimbursable-total')).toHaveTextContent('$300'),
    );
  });

  it('uses the calculated amount when it exceeds the floor', async () => {
    // monthly 500 + annual 1200/12 = 600 → above the $300 floor
    const { getByTestId } = render(
      <TestComponent monthlyCellPhone={500} annualConference={1200} />,
    );

    await waitFor(() =>
      expect(getByTestId('reimbursable-total')).toHaveTextContent('$600'),
    );
  });
});
