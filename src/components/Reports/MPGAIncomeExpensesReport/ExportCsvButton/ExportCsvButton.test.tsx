import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import theme from 'src/theme';
import { exportToCsv } from '../CustomExport/CustomExport';
import { ReportTypeEnum } from '../Helper/MPGAReportEnum';
import { mockData, months } from '../mockData';
import { ExportCsvButton } from './ExportCsvButton';

jest.mock('../CustomExport/CustomExport', () => ({
  exportToCsv: jest.fn(),
}));

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <ExportCsvButton data={mockData} months={months} />
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
      await findByRole('menuitem', { name: 'Income' }),
    ).toBeInTheDocument();
    expect(
      await findByRole('menuitem', { name: 'Expenses' }),
    ).toBeInTheDocument();
  });

  it('exports the income CSV when Income is selected', async () => {
    const { getByRole, findByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: 'Export CSV' }));
    userEvent.click(await findByRole('menuitem', { name: 'Income' }));

    expect(exportToCsv).toHaveBeenCalledWith(
      mockData.income,
      ReportTypeEnum.Income,
      months,
      expect.any(String),
    );
  });

  it('exports the expenses CSV when Expenses is selected', async () => {
    const { getByRole, findByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: 'Export CSV' }));
    userEvent.click(await findByRole('menuitem', { name: 'Expenses' }));

    expect(exportToCsv).toHaveBeenCalledWith(
      mockData.expenses,
      ReportTypeEnum.Expenses,
      months,
      expect.any(String),
    );
  });

  it('closes the menu after an export is selected', async () => {
    const { getByRole, findByRole, queryByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: 'Export CSV' }));
    userEvent.click(await findByRole('menuitem', { name: 'Income' }));

    await waitFor(() =>
      expect(
        queryByRole('menuitem', { name: 'Income' }),
      ).not.toBeInTheDocument(),
    );
  });
});
