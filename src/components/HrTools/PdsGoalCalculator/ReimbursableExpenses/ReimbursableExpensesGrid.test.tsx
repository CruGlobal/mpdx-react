import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PdsGoalCalculatorTestWrapper } from '../PdsGoalCalculatorTestWrapper';
import {
  ReimbursableExpensesGrid,
  ReimbursableField,
} from './ReimbursableExpensesGrid';

const mutationSpy = jest.fn();

const fields: ReimbursableField[] = [
  {
    fieldName: 'ministryCellPhone',
    label: 'Ministry Cell Phone',
    max: 35,
  },
  { fieldName: 'mpdNewsletter', label: 'MPD Newsletter' },
];

interface TestComponentProps {
  subtotalValue?: number;
}

const TestComponent: React.FC<TestComponentProps> = ({ subtotalValue = 0 }) => (
  <PdsGoalCalculatorTestWrapper
    onCall={mutationSpy}
    calculationMock={{
      id: 'goal-1',
      ministryCellPhone: 25,
      mpdNewsletter: 10,
    }}
  >
    <ReimbursableExpensesGrid
      title="Test Section"
      fields={fields}
      subtotalLabel="Test Subtotal"
      subtotalValue={subtotalValue}
      subtotalTestId="test-subtotal"
    />
  </PdsGoalCalculatorTestWrapper>
);

const editAmountCell = async (
  findByRole: ReturnType<typeof render>['findByRole'],
  rowLabel: string,
  newValue: string,
) => {
  const row = await findByRole('row', { name: new RegExp(rowLabel) });
  userEvent.dblClick(row.querySelector('[data-field="amount"]')!);
  const input = await findByRole('spinbutton');
  userEvent.clear(input);
  userEvent.type(input, newValue);
  userEvent.tab();
};

describe('ReimbursableExpensesGrid', () => {
  it('renders the title, header row, data rows, and subtotal row', async () => {
    const { findByRole, getAllByRole } = render(<TestComponent />);

    expect(
      await findByRole('heading', { name: 'Test Section' }),
    ).toBeInTheDocument();
    await findByRole('gridcell', { name: 'Ministry Cell Phone' });
    // 1 header + 2 data rows + 1 subtotal
    expect(getAllByRole('row')).toHaveLength(4);
  });

  it('clips an over-max amount to the field maximum, saves the clipped value, and notifies the user', async () => {
    const { findByRole, findByText } = render(<TestComponent />);

    await editAmountCell(findByRole, 'Ministry Cell Phone', '999');

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UpdatePdsGoalCalculation', {
        attributes: { id: 'goal-1', ministryCellPhone: 35 },
      }),
    );
    expect(
      await findByText('Ministry Cell Phone reduced to its maximum of $35.'),
    ).toBeInTheDocument();
  });

  it('clears the negative-amount error after a subsequent valid edit', async () => {
    const { findByRole, queryByRole } = render(<TestComponent />);

    await editAmountCell(findByRole, 'MPD Newsletter', '-5');
    expect(await findByRole('alert')).toHaveTextContent(
      'Amount must be positive',
    );

    await editAmountCell(findByRole, 'MPD Newsletter', '20');

    await waitFor(() => expect(queryByRole('alert')).not.toBeInTheDocument());
  });

  it('allows any non-negative amount for fields without a max', async () => {
    const { findByRole, queryByRole } = render(<TestComponent />);

    await editAmountCell(findByRole, 'MPD Newsletter', '100');

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UpdatePdsGoalCalculation', {
        attributes: { id: 'goal-1', mpdNewsletter: 100 },
      }),
    );
    expect(queryByRole('alert')).not.toBeInTheDocument();
  });
});
