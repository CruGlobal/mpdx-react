import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon/AdapterLuxon';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import theme from 'src/theme';
import { NoStaffAccount } from './NoStaffAccount';

const router = { query: {}, isReady: true };

const onClick = jest.fn();

const Components = () => (
  <ThemeProvider theme={theme}>
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <TestRouter router={router}>
        <NoStaffAccount />
      </TestRouter>
    </LocalizationProvider>
  </ThemeProvider>
);

describe('NoStaffAccount', () => {
  it('should render the NoStaffAccount component', () => {
    const { getByText, getByRole } = render(<Components />);

    expect(
      getByRole('heading', { name: 'Access to this feature is limited.' }),
    ).toBeInTheDocument();
    expect(
      getByText(
        /our records show that you do not have a staff account. You cannot access this feature if you do not have a staff account. If you think this is a mistake, please contact /i,
      ),
    ).toBeInTheDocument();
    expect(getByRole('link', { name: 'support@mpdx.org' })).toBeInTheDocument();
    expect(
      getByRole('link', { name: 'Back to Dashboard' }),
    ).toBeInTheDocument();
  });

  it('should call onClick when the Back to Dashboard button is clicked', async () => {
    const { getByRole } = render(<Components />);

    const button = getByRole('link', { name: 'Back to Dashboard' });
    await userEvent.click(button);

    expect(onClick).not.toHaveBeenCalled();
  });
});
