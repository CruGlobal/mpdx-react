import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Formik } from 'formik';
import TestRouter from '__tests__/util/TestRouter';
import { RentOwnEnum } from 'src/components/Reports/MinisterHousingAllowance/Shared/sharedTypes';
import theme from 'src/theme';
import { useMinisterHousingAllowance } from '../../../Shared/Context/MinisterHousingAllowanceContext';
import { PageEnum } from '../../../Shared/sharedTypes';
import { CostOfHome } from './CostOfHome';

const submit = jest.fn();

interface TestComponentProps {
  rentOrOwn?: RentOwnEnum;
}

const TestComponent: React.FC<TestComponentProps> = ({ rentOrOwn }) => (
  <ThemeProvider theme={theme}>
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <TestRouter>
        <Formik initialValues={{}} onSubmit={submit}>
          <CostOfHome rentOrOwn={rentOrOwn} />
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

describe('CostOfHome', () => {
  beforeEach(() => {
    useMock.mockReturnValue({
      pageType: PageEnum.New,
    });
  });

  it('renders the component for own', () => {
    const { getByText, getByRole } = render(
      <TestComponent rentOrOwn={RentOwnEnum.Own} />,
    );

    expect(getByRole('table')).toBeInTheDocument();
    expect(
      getByText('Cost of Providing a Home', {
        selector: '.MuiCardHeader-title',
      }),
    ).toBeInTheDocument();

    expect(getByRole('columnheader', { name: 'Category' })).toBeInTheDocument();
    expect(getByRole('columnheader', { name: 'Amount' })).toBeInTheDocument();

    expect(getByText(/monthly mortgage payment, taxes/i)).toBeInTheDocument();
    expect(getByText(/monthly value for furniture/i)).toBeInTheDocument();
    expect(getByText(/estimated monthly cost of repairs/i)).toBeInTheDocument();
  });

  it('renders the component for rent', () => {
    const { getByText, getByRole, queryByText } = render(
      <TestComponent rentOrOwn={RentOwnEnum.Rent} />,
    );

    expect(getByRole('table')).toBeInTheDocument();
    expect(
      getByText('Cost of Providing a Home', {
        selector: '.MuiCardHeader-title',
      }),
    ).toBeInTheDocument();

    expect(getByRole('columnheader', { name: 'Category' })).toBeInTheDocument();
    expect(getByRole('columnheader', { name: 'Amount' })).toBeInTheDocument();

    expect(getByText(/monthly rent/i)).toBeInTheDocument();
    expect(
      queryByText(/monthly mortgage payment, taxes/i),
    ).not.toBeInTheDocument();
  });

  it('should add text fields 1-5 and calculate annual value correctly', async () => {
    const { getByRole, getByText } = render(
      <TestComponent rentOrOwn={RentOwnEnum.Rent} />,
    );

    const row1 = getByRole('row', {
      name: /monthly rent/i,
    });
    const input1 = within(row1).getByPlaceholderText(/enter amount/i);

    const row2 = getByRole('row', { name: /monthly value for furniture/i });
    const input2 = within(row2).getByPlaceholderText(/enter amount/i);

    const row3 = getByRole('row', {
      name: /estimated monthly cost of repairs/i,
    });
    const input3 = within(row3).getByPlaceholderText(/enter amount/i);

    const row4 = getByRole('row', {
      name: /average monthly utility costs/i,
    });
    const input4 = within(row4).getByPlaceholderText(/enter amount/i);

    const row5 = getByRole('row', {
      name: /average monthly amount for unexpected/i,
    });
    const input5 = within(row5).getByPlaceholderText(/enter amount/i);

    await userEvent.type(input1, '1000');
    await userEvent.type(input2, '200');
    await userEvent.type(input3, '300');
    await userEvent.type(input4, '400');
    await userEvent.type(input5, '500');
    userEvent.tab();

    expect(input1).toHaveDisplayValue('$1,000.00');
    expect(input2).toHaveDisplayValue('$200.00');
    expect(input3).toHaveDisplayValue('$300.00');
    expect(input4).toHaveDisplayValue('$400.00');
    expect(input5).toHaveDisplayValue('$500.00');

    expect(getByText('$2,400.00')).toBeInTheDocument();
    expect(getByText('$28,800.00')).toBeInTheDocument();
  });

  describe('isPrint behavior', () => {
    beforeEach(() => {
      useMock.mockReturnValue({
        pageType: PageEnum.View,
      });
    });

    it('should disable text fields when on view page', () => {
      const { getByRole } = render(
        <TestComponent rentOrOwn={RentOwnEnum.Own} />,
      );

      const row = getByRole('row', {
        name: /estimated monthly cost of repairs/i,
      });
      const input = within(row).getByRole('textbox');

      expect(input).toBeDisabled();
    });
  });
});
