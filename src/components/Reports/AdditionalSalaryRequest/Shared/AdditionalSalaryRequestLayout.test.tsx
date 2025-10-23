import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdditionalSalaryRequestTestWrapper } from '../AdditionalSalaryRequestTestWrapper';
import { AdditionalSalaryRequestLayout } from './AdditionalSalaryRequestLayout';

const TestComponent: React.FC = () => (
  <AdditionalSalaryRequestTestWrapper>
    <AdditionalSalaryRequestLayout
      sectionListPanel={<h1>Section List</h1>}
      mainContent={<h1>Main Content</h1>}
    />
  </AdditionalSalaryRequestTestWrapper>
);

describe('AdditionalSalaryRequestLayout', () => {
  it('renders section list and main content', async () => {
    const { getByRole } = render(<TestComponent />);

    expect(getByRole('heading', { name: 'Section List' })).toBeInTheDocument();
    expect(getByRole('heading', { name: 'Main Content' })).toBeInTheDocument();
  });

  it('toggles the drawer', () => {
    const { getByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: 'Toggle Menu' }));
    expect(
      getByRole('navigation', { name: 'Additional Salary Request Sections' }),
    ).toHaveAttribute('aria-expanded', 'true');
  });
});
