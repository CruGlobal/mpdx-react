import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Formik } from 'formik';
import TestRouter from '__tests__/util/TestRouter';
import theme from 'src/theme';
import { useMinisterHousingAllowance } from '../../../Shared/Context/MinisterHousingAllowanceContext';
import { FairRentalValue } from './FairRentalValue';

const submit = jest.fn();

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <TestRouter>
        <Formik initialValues={{}} onSubmit={submit}>
          <FairRentalValue />
        </Formik>
      </TestRouter>
    </LocalizationProvider>
  </ThemeProvider>
);

jest.mock('../../../Shared/Context/MinisterHousingAllowanceContext', () => ({
  ...jest.requireActual(
    '../../../Shared/Context/MinisterHousingAllowanceContext',
  ),
  useMinisterHousingAllowance: jest.fn(),
}));
const useMock = useMinisterHousingAllowance as jest.Mock;

describe('FairRentalValue', () => {
  beforeEach(() =>
    useMock.mockReturnValue({
      isPrint: false,
    }),
  );

  it('renders the component', () => {
    const { getByText, getByRole } = render(<TestComponent />);

    expect(getByRole('table')).toBeInTheDocument();
    expect(getByText('Fair Rental Value')).toBeInTheDocument();

    expect(getByRole('columnheader', { name: 'Category' })).toBeInTheDocument();
    expect(getByRole('columnheader', { name: 'Amount' })).toBeInTheDocument();

    expect(
      getByText(/monthly market rental value of your home/i),
    ).toBeInTheDocument();
    expect(getByText(/monthly value for furniture/i)).toBeInTheDocument();
    expect(getByText(/average monthly utility costs/i)).toBeInTheDocument();
  });

  it('should add text fields 1-3 and calculate annual value correctly', async () => {
    const { getByRole, getByText } = render(<TestComponent />);

    const row1 = getByRole('row', {
      name: /monthly market rental value of your home/i,
    });
    const input1 = within(row1).getByPlaceholderText(/enter amount/i);

    const row2 = getByRole('row', { name: /monthly value for furniture/i });
    const input2 = within(row2).getByPlaceholderText(/enter amount/i);

    const row3 = getByRole('row', {
      name: /average monthly utility costs/i,
    });
    const input3 = within(row3).getByPlaceholderText(/enter amount/i);

    await userEvent.type(input1, '1000');
    await userEvent.type(input2, '200');
    await userEvent.type(input3, '300');
    userEvent.tab();

    expect(input1).toHaveDisplayValue('$1,000.00');
    expect(input2).toHaveDisplayValue('$200.00');
    expect(input3).toHaveDisplayValue('$300.00');

    expect(getByText('$1,500.00')).toBeInTheDocument();
    expect(getByText('$18,000.00')).toBeInTheDocument();
  });

  describe('isPrint behavior', () => {
    it('should disable text fields when isPrint is true', () => {
      useMock.mockReturnValue({
        isPrint: true,
      });

      const { getByRole } = render(<TestComponent />);

      const row = getByRole('row', {
        name: /monthly market rental value of your home/i,
      });
      const input = within(row).getByRole('textbox');

      expect(input).toBeDisabled();
    });
  });
});
