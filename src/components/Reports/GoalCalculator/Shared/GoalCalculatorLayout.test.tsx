import { ThemeProvider } from '@emotion/react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import theme from 'src/theme';
import { GoalCalculatorProvider } from './GoalCalculatorContext';
import { GoalCalculatorLayout } from './GoalCalculatorLayout';

const TestComponent: React.FC = () => (
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

      const initialStep = getByRole('button', { name: 'Calculator Settings' });
      expect(initialStep).toHaveStyle({ color: '#05699B' });

      const newStep = getByRole('button', { name: 'Ministry Expenses' });
      userEvent.click(newStep);
      expect(initialStep).not.toHaveStyle({ color: '#05699B' });
      expect(newStep).toHaveStyle({ color: '#05699B' });
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
