import { ThemeProvider } from '@emotion/react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import theme from 'src/theme';
import { GoalCalculatorProvider } from './GoalCalculatorContext';
import { GoalCalculatorLayout } from './GoalCalculatorLayout';

const TestComponent: React.FC = () => (
  <TestRouter router={{ query: { accountListId: 'account-1' } }}>
    <ThemeProvider theme={theme}>
      <SnackbarProvider>
        <GoalCalculatorProvider>
          <GoalCalculatorLayout
            sectionListPanel={<h1>Section List</h1>}
            mainContent={<h1>Main Content</h1>}
          />
        </GoalCalculatorProvider>
      </SnackbarProvider>
    </ThemeProvider>
  </TestRouter>
);

describe('GoalCalculatorLayout', () => {
  it('renders section list and main content', async () => {
    const { getByRole } = render(<TestComponent />);

    expect(getByRole('heading', { name: 'Section List' })).toBeInTheDocument();
    expect(getByRole('heading', { name: 'Main Content' })).toBeInTheDocument();
  });

  describe('step icons', () => {
    it('change the current step', () => {
      const { getByRole } = render(<TestComponent />);
      const activeColor = theme.palette.mpdxBlue.main;

      const initialStep = getByRole('button', { name: 'Calculator Settings' });
      expect(initialStep).toHaveStyle({ color: activeColor });

      const newStep = getByRole('button', { name: 'Ministry Expenses' });
      userEvent.click(newStep);
      expect(initialStep).not.toHaveStyle({ color: activeColor });
      expect(newStep).toHaveStyle({ color: activeColor });
    });

    it('close the drawer when the current step is clicked', () => {
      const { getByRole } = render(<TestComponent />);

      userEvent.click(getByRole('button', { name: 'Calculator Settings' }));
      expect(
        getByRole('navigation', { name: 'Calculator Settings Sections' }),
      ).toHaveAttribute('aria-expanded', 'false');
    });
  });
});
