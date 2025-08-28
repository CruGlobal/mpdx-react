import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { GoalCalculatorProvider } from '../../Shared/GoalCalculatorContext';
import { GoalCalculatorGrid } from './GoalCalculatorGrid';

jest.mock('src/lib/intlFormat', () => ({
  currencyFormat: (value: number, currency: string, locale: string) =>
    new Intl.NumberFormat(locale, { style: 'currency', currency }).format(
      value,
    ),
}));

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <SnackbarProvider>
    <GoalCalculatorProvider>{children}</GoalCalculatorProvider>
  </SnackbarProvider>
);

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
      <TestWrapper>
        <GoalCalculatorGrid {...defaultProps} />
      </TestWrapper>,
    );

    expect(getByText('Freelance Work')).toBeInTheDocument();
    expect(getByText('Investment Returns')).toBeInTheDocument();
    expect(getByText('Rental Income')).toBeInTheDocument();
    await waitFor(() => {
      expect(getByText('Total')).toBeInTheDocument();
      expect(getByText('$5,500.00')).toBeInTheDocument();
    });
  });

  it('adds a new row when Add button is clicked', async () => {
    const { getByRole, getByText } = render(
      <TestWrapper>
        <GoalCalculatorGrid {...defaultProps} />
      </TestWrapper>,
    );

    userEvent.click(
      getByRole('button', {
        name: /Add Line Item/i,
      }),
    );

    expect(getByText('New Income')).toBeInTheDocument();
    expect(getByText('$5,500.00')).toBeInTheDocument();
  });

  it('removes a row when delete button is clicked', async () => {
    const { getByText, queryByText } = render(
      <TestWrapper>
        <GoalCalculatorGrid {...defaultProps} />
      </TestWrapper>,
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
    expect(getByText('$3,000.00')).toBeInTheDocument();
  });

  it('edits a row name and updates the data', async () => {
    const { queryByDisplayValue, getByDisplayValue, findByText } = render(
      <TestWrapper>
        <GoalCalculatorGrid {...defaultProps} />
      </TestWrapper>,
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
      <TestWrapper>
        <GoalCalculatorGrid {...defaultProps} />
      </TestWrapper>,
    );

    const amountCell = await findByText('$2,500.00');
    userEvent.dblClick(amountCell);

    // Wait for the input to appear and clear it
    await waitFor(async () => {
      const input = getByDisplayValue('2500');
      userEvent.clear(input);
      userEvent.type(input, '3000');
    });

    userEvent.tab();
    expect(await findByText('$6,000.00')).toBeInTheDocument();
  });

  it('prevents editing the total row', async () => {
    const { getByText, getAllByLabelText } = render(
      <TestWrapper>
        <GoalCalculatorGrid {...defaultProps} />
      </TestWrapper>,
    );

    const totalRow = getByText('Total').closest('[role="row"]');
    const editableCells = totalRow?.querySelectorAll(
      '[contenteditable="true"]',
    );
    expect(editableCells).toHaveLength(0);
    userEvent.hover(totalRow!);
    const deleteButtons = getAllByLabelText('Delete');
    expect(deleteButtons).toHaveLength(3);
  });

  it('calculates total correctly when multiple operations are performed', async () => {
    const { getByText, getByRole, findByText, getAllByRole } = render(
      <TestWrapper>
        <GoalCalculatorGrid {...defaultProps} />
      </TestWrapper>,
    );

    expect(getByText('$5,500.00')).toBeInTheDocument();
    userEvent.click(
      getByRole('button', {
        name: /Add Line Item/i,
      }),
    );
    await findByText('New Income');
    expect(getByText('$5,500.00')).toBeInTheDocument();
    const cells = getAllByRole('gridcell');
    const amountCell = cells[cells.length - 3];
    userEvent.click(amountCell);
    userEvent.dblClick(amountCell);
    userEvent.type(amountCell, '2000');
    userEvent.dblClick(cells[cells.length - 1]);
    await waitFor(() => {
      expect(getByText('$5,500.00')).toBeInTheDocument();
    });
  });

  it('displays currency format correctly', async () => {
    const { findByText } = render(
      <TestWrapper>
        <GoalCalculatorGrid {...defaultProps} />
      </TestWrapper>,
    );

    expect(await findByText('$2,500.00')).toBeInTheDocument();
    expect(await findByText('$1,200.00')).toBeInTheDocument();
    expect(await findByText('$1,800.00')).toBeInTheDocument();
  });

  it('toggles between Lump Sum and Line Item buttons', async () => {
    const {
      getByText,
      findByLabelText,
      queryByRole,
      findByRole,
      queryByLabelText,
      getByRole,
    } = render(
      <TestWrapper>
        <GoalCalculatorGrid {...defaultProps} />
      </TestWrapper>,
    );

    const lumpSumButton = getByText('Lump Sum');
    const lineItemButton = getByText('Line Item');
    expect(queryByLabelText('Total')).not.toBeInTheDocument();
    expect(getByRole('grid')).toBeInTheDocument();
    userEvent.click(lumpSumButton);
    expect(await findByLabelText('Total')).toBeInTheDocument();
    expect(queryByRole('grid')).not.toBeInTheDocument();
    userEvent.click(lineItemButton);
    expect(await findByRole('grid')).toBeInTheDocument();
    expect(queryByLabelText('Total')).not.toBeInTheDocument();
  });

  it('allows entering a value in the lump sum text field', async () => {
    const { getByText, findByLabelText } = render(
      <TestWrapper>
        <GoalCalculatorGrid {...defaultProps} />
      </TestWrapper>,
    );

    const lumpSumButton = getByText('Lump Sum');
    userEvent.click(lumpSumButton);
    const textField = await findByLabelText('Total');
    expect(textField).toBeInTheDocument();
    userEvent.clear(textField);
    userEvent.type(textField, '1500');
    expect(textField).toHaveValue(1500);
  });

  it('preserves lump sum value when switching between modes', async () => {
    const { getByText, findByLabelText } = render(
      <TestWrapper>
        <GoalCalculatorGrid {...defaultProps} />
      </TestWrapper>,
    );

    const lumpSumButton = getByText('Lump Sum');
    const lineItemButton = getByText('Line Item');
    userEvent.click(lumpSumButton);
    const textField = await findByLabelText('Total');
    userEvent.clear(textField);
    userEvent.type(textField, '2500');
    userEvent.click(lineItemButton);
    userEvent.click(lumpSumButton);
    expect(textField).toHaveValue(2500);
  });

  it('shows Add Line Item button only in Line Item mode', async () => {
    const { getByText, findByText, queryByText } = render(
      <TestWrapper>
        <GoalCalculatorGrid {...defaultProps} />
      </TestWrapper>,
    );

    const lumpSumButton = getByText('Lump Sum');
    expect(await findByText(/Add Line Item/i)).toBeInTheDocument();
    userEvent.click(lumpSumButton);
    expect(queryByText(/Add Line Item/i)).not.toBeInTheDocument();
  });

  it('renders without prompt text when not provided', async () => {
    const propsWithoutPrompt = {
      categoryName: 'Special Income Name',
      formData: defaultProps.formData,
    };

    const { queryByText, findByText } = render(
      <TestWrapper>
        <GoalCalculatorGrid {...propsWithoutPrompt} />
      </TestWrapper>,
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
      <TestWrapper>
        <GoalCalculatorGrid {...propsWithoutData} />
      </TestWrapper>,
    );

    expect(getByText('Freelance Work')).toBeInTheDocument();
    expect(getByText('Investment Returns')).toBeInTheDocument();
    expect(getByText('Rental Income')).toBeInTheDocument();
  });
});
