import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { PdsGoalCalculatorTestWrapper } from '../PdsGoalCalculatorTestWrapper';
import { AnnualReimbursableSection } from './AnnualReimbursableSection';
import { editAmountCell } from './reimbursableExpensesTestUtils';

const mutationSpy = jest.fn();

const TestComponent: React.FC = () => (
  <PdsGoalCalculatorTestWrapper
    onCall={mutationSpy}
    calculationMock={{
      id: 'goal-1',
      conferenceRetreatCosts: 600,
      ministryTravelMeals: 300,
      otherAnnualReimbursements: 100,
    }}
  >
    <AnnualReimbursableSection />
  </PdsGoalCalculatorTestWrapper>
);

describe('AnnualReimbursableSection', () => {
  beforeEach(() => {
    mutationSpy.mockClear();
  });

  it('renders the section heading and column headers', async () => {
    const { findByRole, getByRole } = render(<TestComponent />);

    expect(
      await findByRole('heading', { name: 'Annual Reimbursable Expenses' }),
    ).toBeInTheDocument();
    expect(
      getByRole('columnheader', { name: 'Expense Name' }),
    ).toBeInTheDocument();
    expect(getByRole('columnheader', { name: 'Amount' })).toBeInTheDocument();
  });

  it('renders a row for every annual field plus the subtotal', async () => {
    const { findByRole, getAllByRole } = render(<TestComponent />);

    await findByRole('gridcell', { name: 'Conference / Retreat Costs' });
    // 1 header row + 3 field rows + 1 subtotal row
    expect(getAllByRole('row')).toHaveLength(5);
  });

  it('renders the info tooltip icon with an accessible label', async () => {
    const { findByLabelText } = render(<TestComponent />);

    expect(
      await findByLabelText(
        'This annual amount will be divided by 12 when added to the total.',
      ),
    ).toBeInTheDocument();
  });

  it('renders the annual subtotal from the calculation', async () => {
    const { getByTestId } = render(<TestComponent />);

    await waitFor(() =>
      expect(getByTestId('annual-subtotal')).toHaveTextContent('$1,000'),
    );
  });

  it('autosaves an edit to Conference / Retreat Costs', async () => {
    const { findByRole } = render(<TestComponent />);

    await editAmountCell(findByRole, 'Conference / Retreat Costs', '800');

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UpdatePdsGoalCalculation', {
        attributes: { id: 'goal-1', conferenceRetreatCosts: 800 },
      }),
    );
  });

  it('autosaves an edit to Ministry Travel / Meals', async () => {
    const { findByRole } = render(<TestComponent />);

    await editAmountCell(findByRole, 'Ministry Travel / Meals', '450');

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UpdatePdsGoalCalculation', {
        attributes: { id: 'goal-1', ministryTravelMeals: 450 },
      }),
    );
  });

  it('autosaves an edit to Other Annual Reimbursements', async () => {
    const { findByRole } = render(<TestComponent />);

    await editAmountCell(findByRole, 'Other Annual Reimbursements', '75');

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UpdatePdsGoalCalculation', {
        attributes: { id: 'goal-1', otherAnnualReimbursements: 75 },
      }),
    );
  });

  it('shows an error and skips saving when a negative amount is entered', async () => {
    const { findByRole } = render(<TestComponent />);

    await editAmountCell(findByRole, 'Ministry Travel / Meals', '-10');

    expect(await findByRole('alert')).toHaveTextContent(
      'Amount must be positive',
    );
    expect(mutationSpy).not.toHaveGraphqlOperation('UpdatePdsGoalCalculation');
  });
});
