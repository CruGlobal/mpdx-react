import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import theme from 'src/theme';
import { ExpensesClaim } from './ExpensesClaim';

const onClose = jest.fn();

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <TestRouter>
        <ExpensesClaim onClose={onClose} />
      </TestRouter>
    </LocalizationProvider>
  </ThemeProvider>
);

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

    expect(onClose).toHaveBeenCalled();
  });
});
