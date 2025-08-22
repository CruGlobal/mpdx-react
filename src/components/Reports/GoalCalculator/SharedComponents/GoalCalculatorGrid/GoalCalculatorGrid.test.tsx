import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GoalCalculatorTestWrapper } from '../../GoalCalculatorTestWrapper';
import { GoalCalculatorGrid } from './GoalCalculatorGrid';

const defaultProps = {
  categoryName: 'Special Income Name',
  promptText: 'Add your special income sources',
  formData: [
    { id: 1, name: 'Freelance Work', amount: 2500 },
    { id: 2, name: 'Investment Returns', amount: 1200 },
    { id: 3, name: 'Rental Income', amount: 1800 },
  ],
};

describe('GoalCalculatorGrid', () => {
  it('renders with initial data and calculates total correctly', async () => {
    const { getByText } = render(
      <GoalCalculatorTestWrapper>
        <GoalCalculatorGrid {...defaultProps} />
      </GoalCalculatorTestWrapper>,
    );

    expect(getByText('Freelance Work')).toBeInTheDocument();
    expect(getByText('Investment Returns')).toBeInTheDocument();
    expect(getByText('Rental Income')).toBeInTheDocument();
    await waitFor(() => {
      expect(getByText('Total')).toBeInTheDocument();
      expect(getByText('$5,500')).toBeInTheDocument();
    });
  });

  it('adds a new row when Add button is clicked', async () => {
    const { getByRole, getByText } = render(
      <GoalCalculatorTestWrapper>
        <GoalCalculatorGrid {...defaultProps} />
      </GoalCalculatorTestWrapper>,
    );

    userEvent.click(
      getByRole('button', {
        name: /add special income name/i,
      }),
    );

    expect(getByText('New Income')).toBeInTheDocument();
    expect(getByText('$5,500')).toBeInTheDocument();
  });

  it('removes a row when delete button is clicked', async () => {
    const { getByText, queryByText } = render(
      <GoalCalculatorTestWrapper>
        <GoalCalculatorGrid {...defaultProps} />
      </GoalCalculatorTestWrapper>,
    );
    const freelanceRow = getByText('Freelance Work').closest('[role="row"]');
    userEvent.hover(freelanceRow!);
    const deleteButton = freelanceRow?.querySelector('[aria-label="Delete"]');
    if (deleteButton) {
      userEvent.click(deleteButton as Element);
    }
    await waitFor(() => {
      expect(queryByText('Freelance Work')).not.toBeInTheDocument();
    });
    expect(getByText('$3,000')).toBeInTheDocument();
  });

  it('edits a row name and updates the data', async () => {
    const { queryByDisplayValue, getByDisplayValue, findByText } = render(
      <GoalCalculatorTestWrapper>
        <GoalCalculatorGrid {...defaultProps} />
      </GoalCalculatorTestWrapper>,
    );

    const nameCell = await findByText('Freelance Work');
    userEvent.dblClick(nameCell);

    await waitFor(() => {
      const input = getByDisplayValue('Freelance Work');
      userEvent.clear(input);
      userEvent.type(input, 'Consulting Work');
      userEvent.tab();
    });

    await waitFor(() => {
      expect(queryByDisplayValue('Freelance Work')).not.toBeInTheDocument();
    });
    expect(await findByText('Consulting Work')).toBeInTheDocument();
  });

  it('edits a row amount and updates the total', async () => {
    const { findByText, getByDisplayValue } = render(
      <GoalCalculatorTestWrapper>
        <GoalCalculatorGrid {...defaultProps} />
      </GoalCalculatorTestWrapper>,
    );

    const amountCell = await findByText('$2,500');
    userEvent.dblClick(amountCell);

    // Wait for the input to appear and clear it
    await waitFor(async () => {
      const input = getByDisplayValue('2500');
      userEvent.clear(input);
      userEvent.type(input, '3000');
    });

    userEvent.tab();
    expect(await findByText('$6,000')).toBeInTheDocument();
  });

  it('prevents editing the total row', async () => {
    const { getByText, queryAllByLabelText } = render(
      <GoalCalculatorTestWrapper>
        <GoalCalculatorGrid {...defaultProps} />
      </GoalCalculatorTestWrapper>,
    );

    const totalRow = getByText('Total').closest('[role="row"]');
    const editableCells = totalRow?.querySelectorAll(
      '[contenteditable="true"]',
    );
    expect(editableCells).toHaveLength(0);
    userEvent.hover(totalRow!);
    const deleteButtons = queryAllByLabelText('Delete');
    expect(deleteButtons).toHaveLength(3);
  });

  it('calculates total correctly when multiple operations are performed', async () => {
    const { getByText, getByRole, findByText, getAllByRole } = render(
      <GoalCalculatorTestWrapper>
        <GoalCalculatorGrid {...defaultProps} />
      </GoalCalculatorTestWrapper>,
    );

    expect(getByText('$5,500')).toBeInTheDocument();
    userEvent.click(
      getByRole('button', {
        name: /add special income name/i,
      }),
    );
    await findByText('New Income');
    expect(getByText('$5,500')).toBeInTheDocument();
    const cells = getAllByRole('gridcell');
    const amountCell = cells[cells.length - 3];
    userEvent.click(amountCell);
    userEvent.dblClick(amountCell);
    userEvent.type(amountCell, '2000');
    userEvent.dblClick(cells[cells.length - 1]);
    await waitFor(() => {
      expect(getByText('$5,500')).toBeInTheDocument();
    });
  });

  it('displays currency format correctly', async () => {
    const { findByText } = render(
      <GoalCalculatorTestWrapper>
        <GoalCalculatorGrid {...defaultProps} />
      </GoalCalculatorTestWrapper>,
    );

    expect(await findByText('$2,500')).toBeInTheDocument();
    expect(await findByText('$1,200')).toBeInTheDocument();
    expect(await findByText('$1,800')).toBeInTheDocument();
  });

  it('toggles direct input switch', async () => {
    const { getByRole } = render(
      <GoalCalculatorTestWrapper>
        <GoalCalculatorGrid {...defaultProps} />
      </GoalCalculatorTestWrapper>,
    );

    const directInputSwitch = getByRole('checkbox');
    expect(directInputSwitch).not.toBeChecked();
    userEvent.click(directInputSwitch);
    expect(directInputSwitch).toBeChecked();
    userEvent.click(directInputSwitch);
    expect(directInputSwitch).not.toBeChecked();
  });

  it('renders without prompt text when not provided', async () => {
    const propsWithoutPrompt = {
      categoryName: 'Special Income Name',
      formData: defaultProps.formData,
    };

    const { queryByText, findByText } = render(
      <GoalCalculatorTestWrapper>
        <GoalCalculatorGrid {...propsWithoutPrompt} />
      </GoalCalculatorTestWrapper>,
    );

    expect(
      queryByText('Add your special income sources'),
    ).not.toBeInTheDocument();
    expect(await findByText('Freelance Work')).toBeInTheDocument();
  });

  it('uses default data when no formData is provided', () => {
    const propsWithoutData = {
      categoryName: 'Special Income Name',
    };

    const { getByText } = render(
      <GoalCalculatorTestWrapper>
        <GoalCalculatorGrid {...propsWithoutData} />
      </GoalCalculatorTestWrapper>,
    );

    expect(getByText('Freelance Work')).toBeInTheDocument();
    expect(getByText('Investment Returns')).toBeInTheDocument();
    expect(getByText('Rental Income')).toBeInTheDocument();
  });
});
