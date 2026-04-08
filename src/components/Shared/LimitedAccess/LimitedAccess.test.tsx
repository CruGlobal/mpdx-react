import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import theme from 'src/theme';
import { LimitedAccess } from './LimitedAccess';

const router = {
  query: { accountListId: 'acc_123' },
};

interface ComponentsProps {
  noStaffAccount?: boolean;
}

const Components: React.FC<ComponentsProps> = ({ noStaffAccount }) => (
  <ThemeProvider theme={theme}>
    <TestRouter router={router}>
      <LimitedAccess noStaffAccount={noStaffAccount} />
    </TestRouter>
  </ThemeProvider>
);

describe('LimitedAccess', () => {
  it('should render the LimitedAccess component and dashboard link when no staff account exists', () => {
    const { getByText, getByRole } = render(<Components noStaffAccount />);

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

  it('should render the LimitedAccess component and dashboard link when wrong user group', () => {
    const { getByText, getByRole } = render(<Components />);

    expect(
      getByRole('heading', { name: 'Access to this feature is limited.' }),
    ).toBeInTheDocument();
    expect(
      getByText(
        /our records show that you are not part of the user group that has access to this feature/i,
      ),
    ).toBeInTheDocument();
    expect(getByRole('link', { name: 'support@mpdx.org' })).toBeInTheDocument();

    const button = getByRole('link', { name: 'Back to Dashboard' });
    expect(button).toBeInTheDocument();

    expect(button).toHaveAttribute('href', `/accountLists/acc_123`);
  });
});
