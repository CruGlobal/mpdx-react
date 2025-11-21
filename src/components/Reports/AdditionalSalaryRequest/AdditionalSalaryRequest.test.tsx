import { render } from '@testing-library/react';
import { AdditionalSalaryRequest } from './AdditionalSalaryRequest';
import { AdditionalSalaryRequestTestWrapper } from './AdditionalSalaryRequestTestWrapper';

describe('AdditionalSalaryRequest', () => {
  it('renders sidebar with steps', () => {
    const { getByRole, getByText } = render(
      <AdditionalSalaryRequestTestWrapper>
        <AdditionalSalaryRequest />
      </AdditionalSalaryRequestTestWrapper>,
    );

    expect(
      getByRole('navigation', { name: 'Additional Salary Request Sections' }),
    ).toBeInTheDocument();

    expect(getByText('1. About this Form')).toBeInTheDocument();
    expect(getByText('2. Complete Form')).toBeInTheDocument();
    expect(getByText('3. Receipt')).toBeInTheDocument();
  });
});
