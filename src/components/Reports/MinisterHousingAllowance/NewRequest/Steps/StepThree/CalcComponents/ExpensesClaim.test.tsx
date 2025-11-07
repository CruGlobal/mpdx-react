import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import {
  MinisterHousingAllowanceProvider,
  useMinisterHousingAllowance,
} from 'src/components/Reports/MinisterHousingAllowance/Shared/MinisterHousingAllowanceContext';
import theme from 'src/theme';
import { ExpensesClaim } from './ExpensesClaim';

const handleRightPanelClose = jest.fn();

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <TestRouter>
        <MinisterHousingAllowanceProvider>
          <ExpensesClaim />
        </MinisterHousingAllowanceProvider>
      </TestRouter>
    </LocalizationProvider>
  </ThemeProvider>
);

jest.mock(
  'src/components/Reports/MinisterHousingAllowance/Shared/MinisterHousingAllowanceContext',
  () => ({
    ...jest.requireActual(
      'src/components/Reports/MinisterHousingAllowance/Shared/MinisterHousingAllowanceContext',
    ),
    useMinisterHousingAllowance: jest.fn(),
  }),
);

(useMinisterHousingAllowance as jest.Mock).mockReturnValue({
  handleRightPanelClose,
});

describe('ExpensesClaim', () => {
  it('renders the component', () => {
    const { getByText } = render(<TestComponent />);

    expect(
      getByText(/what expenses can i claim on my mha/i),
    ).toBeInTheDocument();
    expect(
      getByText(/the following is a list of typical expenses/i),
    ).toBeInTheDocument();
  });

  it('calls onClose when the close icon is clicked', async () => {
    const { getByTestId } = render(<TestComponent />);

    await userEvent.click(getByTestId('CloseIcon'));

    expect(handleRightPanelClose).toHaveBeenCalled();
  });
});
