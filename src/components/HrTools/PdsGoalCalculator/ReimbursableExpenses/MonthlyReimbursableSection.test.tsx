import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  MpdGoalMiscConstantCategoryEnum,
  MpdGoalMiscConstantLabelEnum,
} from 'src/graphql/types.generated';
import { PdsGoalCalculatorTestWrapper } from '../PdsGoalCalculatorTestWrapper';
import { MonthlyReimbursableSection } from './MonthlyReimbursableSection';
import { editAmountCell } from './reimbursableExpensesTestUtils';

const prepopulatedTooltipText =
  'Pre-filled with the maximum allowed amount. Edit to a lower value if needed.';

const mutationSpy = jest.fn();

const TestComponent: React.FC = () => (
  <PdsGoalCalculatorTestWrapper
    onCall={mutationSpy}
    calculationMock={{
      id: 'goal-1',
      ministryCellPhone: 35,
      ministryInternet: 30,
      mpdNewsletter: 25,
      mpdMiscellaneous: 10,
      accountTransfers: 50,
      otherMonthlyReimbursements: 10,
    }}
    constantsMock={{
      mpdGoalMiscConstants: [
        {
          category: MpdGoalMiscConstantCategoryEnum.ReimbursementsWithMaximum,
          label: MpdGoalMiscConstantLabelEnum.Phone,
          fee: 35,
        },
        {
          category: MpdGoalMiscConstantCategoryEnum.ReimbursementsWithMaximum,
          label: MpdGoalMiscConstantLabelEnum.Internet,
          fee: 30,
        },
      ],
    }}
  >
    <MonthlyReimbursableSection />
  </PdsGoalCalculatorTestWrapper>
);

describe('MonthlyReimbursableSection', () => {
  it('renders the description text below the heading', async () => {
    const { findByText } = render(<TestComponent />);

    expect(
      await findByText(
        'Ministry Cell Phone and Ministry Internet reimbursements are capped at the per-month maximums shown next to each field name. Amounts above the maximum will not be saved.',
      ),
    ).toBeInTheDocument();
  });

  it('shows each maximum inline with the field name', async () => {
    const { findByRole, getByRole } = render(<TestComponent />);

    expect(
      await findByRole('gridcell', {
        name: /Ministry Cell Phone \(max \$35\/mo\)/,
      }),
    ).toBeInTheDocument();
    expect(
      getByRole('gridcell', {
        name: /Ministry Internet \(max \$30\/mo\)/,
      }),
    ).toBeInTheDocument();
  });

  it('renders an info icon on the cell phone and internet rows with a prepopulation tooltip', async () => {
    const { findAllByLabelText, findByRole } = render(<TestComponent />);

    const icons = await findAllByLabelText(prepopulatedTooltipText);
    expect(icons).toHaveLength(2);

    userEvent.hover(icons[0]);
    expect(await findByRole('tooltip')).toHaveTextContent(
      prepopulatedTooltipText,
    );
  });

  it('renders the section heading and column headers', async () => {
    const { findByRole, getByRole } = render(<TestComponent />);

    expect(
      await findByRole('heading', { name: 'Monthly Reimbursable Expenses' }),
    ).toBeInTheDocument();
    expect(
      getByRole('columnheader', { name: 'Expense Name' }),
    ).toBeInTheDocument();
    expect(getByRole('columnheader', { name: 'Amount' })).toBeInTheDocument();
  });

  it('renders a row for every monthly field plus the subtotal', async () => {
    const { findByRole, getAllByRole } = render(<TestComponent />);

    await findByRole('gridcell', {
      name: /Ministry Cell Phone \(max \$35\/mo\)/,
    });
    // 1 header row + 6 field rows + 1 subtotal row
    expect(getAllByRole('row')).toHaveLength(8);
  });

  it('renders the monthly subtotal from the calculation', async () => {
    const { getByTestId } = render(<TestComponent />);

    await waitFor(() =>
      expect(getByTestId('monthly-subtotal')).toHaveTextContent('$160'),
    );
  });

  it('autosaves a valid amount edit', async () => {
    const { findByRole } = render(<TestComponent />);

    await editAmountCell(findByRole, 'Ministry Cell Phone', '20');

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UpdatePdsGoalCalculation', {
        attributes: { id: 'goal-1', ministryCellPhone: 20 },
      }),
    );
  });

  it('shows an error and skips saving when an amount exceeds the configured maximum', async () => {
    const { findByRole } = render(<TestComponent />);

    await editAmountCell(findByRole, 'Ministry Cell Phone', '999');

    expect(await findByRole('alert')).toHaveTextContent(
      'Amount cannot exceed $35',
    );

    expect(mutationSpy).not.toHaveGraphqlOperation('UpdatePdsGoalCalculation');
  });

  it('shows an error and skips saving when a negative amount is entered', async () => {
    const { findByRole } = render(<TestComponent />);

    await editAmountCell(findByRole, 'MPD Newsletter', '-5');

    expect(await findByRole('alert')).toHaveTextContent(
      'Amount must be positive',
    );

    expect(mutationSpy).not.toHaveGraphqlOperation('UpdatePdsGoalCalculation');
  });
});
