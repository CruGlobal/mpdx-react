import { render } from '@testing-library/react';
import { AdditionalSalaryRequest } from './AdditionalSalaryRequest';
import { AdditionalSalaryRequestTestWrapper } from './AdditionalSalaryRequestTestWrapper';

const TestWrapper: React.FC = () => (
  <AdditionalSalaryRequestTestWrapper>
    <AdditionalSalaryRequest />
  </AdditionalSalaryRequestTestWrapper>
);

describe('AdditionalSalaryRequest', () => {
  it('renders main content based on selected section', async () => {
    const { getByRole, getByText } = render(<TestWrapper />);

    expect(
      getByRole('navigation', { name: 'Additional Salary Request Sections' }),
    ).toBeInTheDocument();

    expect(getByText('1. About this Form')).toBeInTheDocument();
    expect(getByText('2. Complete Form')).toBeInTheDocument();
    expect(getByText('3. Receipt')).toBeInTheDocument();
  });
});
