import { render, waitFor, within } from '@testing-library/react';
import { PdsGoalCalculatorTestWrapper } from '../PdsGoalCalculatorTestWrapper';
import { ReimbursableExpensesSectionList } from './ReimbursableExpensesSectionList';

const allReimbursableUntouched = {
  ministryCellPhone: null,
  ministryInternet: null,
  mpdNewsletter: null,
  mpdMiscellaneous: null,
  accountTransfers: null,
  otherMonthlyReimbursements: null,
  conferenceRetreatCosts: null,
  ministryTravelMeals: null,
  otherAnnualReimbursements: null,
};

describe('ReimbursableExpensesSectionList', () => {
  it('renders both sections as incomplete when no reimbursable fields have been touched', async () => {
    const { findAllByRole } = render(
      <PdsGoalCalculatorTestWrapper calculationMock={allReimbursableUntouched}>
        <ReimbursableExpensesSectionList />
      </PdsGoalCalculatorTestWrapper>,
    );

    const items = await findAllByRole('listitem');
    expect(items).toHaveLength(2);

    const [monthly, annual] = items;
    expect(monthly).toHaveTextContent('Monthly Reimbursable Expenses');
    expect(annual).toHaveTextContent('Annual Reimbursable Expenses');

    await waitFor(() => {
      expect(
        within(monthly).getByTestId('RadioButtonUncheckedIcon'),
      ).toBeInTheDocument();
      expect(
        within(annual).getByTestId('RadioButtonUncheckedIcon'),
      ).toBeInTheDocument();
    });
  });

  it('marks only Monthly complete when a monthly field is touched', async () => {
    const { findAllByRole } = render(
      <PdsGoalCalculatorTestWrapper
        calculationMock={{ ...allReimbursableUntouched, ministryCellPhone: 25 }}
      >
        <ReimbursableExpensesSectionList />
      </PdsGoalCalculatorTestWrapper>,
    );

    const [monthly, annual] = await findAllByRole('listitem');
    await waitFor(() => {
      expect(within(monthly).getByTestId('CircleIcon')).toBeInTheDocument();
      expect(
        within(annual).getByTestId('RadioButtonUncheckedIcon'),
      ).toBeInTheDocument();
    });
  });

  it('marks only Annual complete when an annual field is touched', async () => {
    const { findAllByRole } = render(
      <PdsGoalCalculatorTestWrapper
        calculationMock={{
          ...allReimbursableUntouched,
          conferenceRetreatCosts: 100,
        }}
      >
        <ReimbursableExpensesSectionList />
      </PdsGoalCalculatorTestWrapper>,
    );

    const [monthly, annual] = await findAllByRole('listitem');
    await waitFor(() => {
      expect(
        within(monthly).getByTestId('RadioButtonUncheckedIcon'),
      ).toBeInTheDocument();
      expect(within(annual).getByTestId('CircleIcon')).toBeInTheDocument();
    });
  });
});
