import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import {
  afterTestResizeObserver,
  beforeTestResizeObserver,
} from '__tests__/util/windowResizeObserver';
import theme from 'src/theme';
import { GoalCalculatorProvider } from '../../Shared/GoalCalculatorContext';
import { GoalCalculatorGrid } from './GoalCalculatorGrid';

jest.mock('src/hooks/useLocale', () => ({
  useLocale: () => 'en-US',
}));

jest.mock('src/lib/intlFormat', () => ({
  currencyFormat: (value: number, currency: string, locale: string) =>
    new Intl.NumberFormat(locale, { style: 'currency', currency }).format(
      value,
    ),
}));

jest.mock('notistack', () => ({
  useSnackbar: () => ({
    enqueueSnackbar: jest.fn(),
    closeSnackbar: jest.fn(),
  }),
  SnackbarProvider: ({ children }: { children: React.ReactNode }) => children,
}));

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>
    <SnackbarProvider maxSnack={3}>
      <GoalCalculatorProvider>{children}</GoalCalculatorProvider>
    </SnackbarProvider>
  </ThemeProvider>
);

const defaultProps = {
  headerName: 'Special Income Name',
  promptText: 'Add your special income sources',
  formData: [
    { id: 1, name: 'Freelance Work', amount: 2500 },
    { id: 2, name: 'Investment Returns', amount: 1200 },
    { id: 3, name: 'Rental Income', amount: 1800 },
  ],
};

describe('GoalCalculatorGrid', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    beforeTestResizeObserver();
  });
  afterEach(() => {
    afterTestResizeObserver();
  });

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
    const { getByRole, getByText, findByText } = render(
      <TestWrapper>
        <GoalCalculatorGrid {...defaultProps} />
      </TestWrapper>,
    );

    userEvent.click(
      getByRole('button', {
        name: /add special income name/i,
      }),
    );
    await findByText('New Income');
    expect(getByText('$5,500.00')).toBeInTheDocument();
  });

  it('removes a row when delete button is clicked', async () => {
    const { getByText, queryByText } = render(
      <TestWrapper>
        <GoalCalculatorGrid {...defaultProps} />
      </TestWrapper>,
    );

    // Find the Freelance Work row and hover to show delete button
    const freelanceRow = getByText('Freelance Work').closest('[role="row"]');
    userEvent.hover(freelanceRow!);

    // Find and click the delete button for this row
    const deleteButtons = freelanceRow?.querySelectorAll(
      '[aria-label="Delete"]',
    );
    if (deleteButtons && deleteButtons.length > 0) {
      userEvent.click(deleteButtons[0] as Element);
    }

    // Wait for the row to be removed and total to update
    await waitFor(() => {
      expect(queryByText('Freelance Work')).not.toBeInTheDocument();
      expect(getByText('$3,000.00')).toBeInTheDocument(); // 5500 - 2500 = 3000
    });
  });

  it('edits a row name and updates the data', async () => {
    const { queryByDisplayValue, findByText } = render(
      <TestWrapper>
        <GoalCalculatorGrid {...defaultProps} />
      </TestWrapper>,
    );

    const nameCell = await findByText('Freelance Work');
    userEvent.dblClick(nameCell);
    userEvent.type(nameCell, 'Consulting Work');
    userEvent.tab();

    await waitFor(() => {
      expect(queryByDisplayValue('Freelance Work')).not.toBeInTheDocument();
    });
    expect(await findByText('Consulting Work')).toBeInTheDocument();
  });

  it('edits a row amount and updates the total', async () => {
    const { getAllByRole, findByText } = render(
      <TestWrapper>
        <GoalCalculatorGrid {...defaultProps} />
      </TestWrapper>,
    );

    const amountInputs = getAllByRole('gridcell');
    const firstAmountInput = amountInputs[amountInputs.length - 3];
    userEvent.dblClick(firstAmountInput);
    userEvent.type(firstAmountInput, '500');
    userEvent.tab();
    expect(await findByText('$6,000.00')).toBeInTheDocument();
  });

  it('prevents editing the total row', async () => {
    const { getByText, queryAllByLabelText } = render(
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
    const deleteButtons = queryAllByLabelText('Delete');
    expect(deleteButtons).toHaveLength(3); // Only for the 3 data rows, not total
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
        name: /add special income name/i,
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

  it('toggles direct input switch', async () => {
    const { getByRole } = render(
      <TestWrapper>
        <GoalCalculatorGrid {...defaultProps} />
      </TestWrapper>,
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
      headerName: 'Special Income Name',
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
      headerName: 'Special Income Name',
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
