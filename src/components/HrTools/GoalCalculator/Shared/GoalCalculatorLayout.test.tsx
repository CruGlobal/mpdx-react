import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import theme from 'src/theme';
import { GoalCalculatorTestWrapper } from '../GoalCalculatorTestWrapper';
import { GoalCalculatorLayout } from './GoalCalculatorLayout';

interface TestComponentProps {
  readOnly?: boolean;
  onCall?: jest.Mock;
}

const TestComponent: React.FC<TestComponentProps> = ({ readOnly, onCall }) => (
  <GoalCalculatorTestWrapper readOnly={readOnly} onCall={onCall}>
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

  describe('read-only alert', () => {
    it('shows an explanation when the goal is read-only', async () => {
      const { findByText } = render(<TestComponent readOnly />);

      expect(
        await findByText('This goal is finalized and read-only.'),
      ).toBeInTheDocument();
    });

    it('does not show an explanation when the goal is editable', async () => {
      const mutationSpy = jest.fn();
      const { queryByText } = render(<TestComponent onCall={mutationSpy} />);

      // Wait for the goal calculation query to load
      await waitFor(() =>
        expect(mutationSpy).toHaveGraphqlOperation('GoalCalculation'),
      );
      expect(
        queryByText('This goal is finalized and read-only.'),
      ).not.toBeInTheDocument();
    });
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
