import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import theme from 'src/theme';
import { NoStaffAccount } from './NoStaffAccount';

const router = {
  query: { accountListId: 'acc_123' },
};

const Components = () => (
  <ThemeProvider theme={theme}>
    <TestRouter router={router}>
      <NoStaffAccount />
    </TestRouter>
  </ThemeProvider>
);

describe('NoStaffAccount', () => {
  it('should render the NoStaffAccount component and dashboard link', () => {
    const { getByText, getByRole } = render(<Components />);

    expect(
      getByRole('heading', { name: 'Access to this feature is limited.' }),
    ).toBeInTheDocument();
    expect(
      getByText(/our records show that you do not have a staff account/i),
    ).toBeInTheDocument();
    expect(getByRole('link', { name: 'support@mpdx.org' })).toBeInTheDocument();

    const button = getByRole('link', { name: 'Back to Dashboard' });
    expect(button).toBeInTheDocument();

    expect(button).toHaveAttribute('href', `/accountLists/acc_123`);
  });
});
