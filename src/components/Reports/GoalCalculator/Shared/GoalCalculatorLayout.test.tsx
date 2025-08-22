import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import theme from 'src/theme';
import { GoalCalculatorTestWrapper } from '../GoalCalculatorTestWrapper';
import { GoalCalculatorLayout } from './GoalCalculatorLayout';

const TestComponent: React.FC = () => (
  <GoalCalculatorTestWrapper>
    <GoalCalculatorLayout
      sectionListPanel={<h1>Section List</h1>}
      mainContent={<h1>Main Content</h1>}
    />
  </GoalCalculatorTestWrapper>
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
