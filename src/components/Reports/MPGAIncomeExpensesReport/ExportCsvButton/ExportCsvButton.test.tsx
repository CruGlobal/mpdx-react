import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import theme from 'src/theme';
import { exportToCsv } from '../CustomExport/CustomExport';
import { ReportTypeEnum } from '../Helper/MPGAReportEnum';
import { AllData, mockData, months } from '../mockData';
import { ExportCsvButton } from './ExportCsvButton';

jest.mock('../CustomExport/CustomExport', () => ({
  exportToCsv: jest.fn(),
}));

const TestComponent: React.FC<{ data?: AllData }> = ({ data = mockData }) => (
  <ThemeProvider theme={theme}>
    <ExportCsvButton data={data} months={months} />
  </ThemeProvider>
);

describe('ExportCsvButton', () => {
  beforeEach(() => {
    (exportToCsv as jest.Mock).mockClear();
  });

  it('renders an Export CSV button', () => {
    const { getByRole } = render(<TestComponent />);

    expect(getByRole('button', { name: 'Export CSV' })).toBeInTheDocument();
  });

  it('opens a menu with Income and Expenses options when clicked', async () => {
    const { getByRole, findByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: 'Export CSV' }));

    expect(
      await findByRole('menuitem', { name: 'Income Report' }),
    ).toBeInTheDocument();
    expect(
      await findByRole('menuitem', { name: 'Expenses Report' }),
    ).toBeInTheDocument();
  });

  it('exports the income CSV when Income is selected', async () => {
    const { getByRole, findByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: 'Export CSV' }));
    userEvent.click(await findByRole('menuitem', { name: 'Income Report' }));

    expect(exportToCsv).toHaveBeenCalledWith(
      mockData.income,
      ReportTypeEnum.Income,
      months,
      'en-US',
    );
  });

  it('exports the expenses CSV when Expenses is selected', async () => {
    const { getByRole, findByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: 'Export CSV' }));
    userEvent.click(await findByRole('menuitem', { name: 'Expenses Report' }));

    expect(exportToCsv).toHaveBeenCalledWith(
      mockData.expenses,
      ReportTypeEnum.Expenses,
      months,
      'en-US',
    );
  });

  it('disables an export option when its dataset is empty', async () => {
    const { getByRole, findByRole } = render(
      <TestComponent data={{ income: mockData.income, expenses: [] }} />,
    );

    userEvent.click(getByRole('button', { name: 'Export CSV' }));

    expect(
      await findByRole('menuitem', { name: 'Income Report' }),
    ).not.toHaveAttribute('aria-disabled');

    const expenses = await findByRole('menuitem', { name: 'Expenses Report' });
    expect(expenses).toHaveAttribute('aria-disabled', 'true');
    expect(exportToCsv).not.toHaveBeenCalled();
  });

  it('disables both export options when all datasets are empty', async () => {
    const { getByRole, findByRole } = render(
      <TestComponent data={{ income: [], expenses: [] }} />,
    );

    userEvent.click(getByRole('button', { name: 'Export CSV' }));

    expect(
      await findByRole('menuitem', { name: 'Income Report' }),
    ).toHaveAttribute('aria-disabled', 'true');
    expect(
      await findByRole('menuitem', { name: 'Expenses Report' }),
    ).toHaveAttribute('aria-disabled', 'true');
    expect(exportToCsv).not.toHaveBeenCalled();
  });

  it('closes the menu after an export is selected', async () => {
    const { getByRole, findByRole, queryByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: 'Export CSV' }));
    userEvent.click(await findByRole('menuitem', { name: 'Income Report' }));

    await waitFor(() =>
      expect(
        queryByRole('menuitem', { name: 'Income Report' }),
      ).not.toBeInTheDocument(),
    );
  });
});
