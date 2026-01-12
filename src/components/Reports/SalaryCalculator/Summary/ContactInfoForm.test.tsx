import { render } from '@testing-library/react';
import { SalaryCalculatorTestWrapper } from '../SalaryCalculatorTestWrapper';
import { ContactInfoForm } from './ContactInfoForm';

const TestComponent: React.FC = () => (
  <SalaryCalculatorTestWrapper>
    <ContactInfoForm />
  </SalaryCalculatorTestWrapper>
);

describe('ContactInfoForm', () => {
  it('renders the inputs', () => {
    const { getByRole } = render(<TestComponent />);

    expect(getByRole('textbox', { name: 'Phone Number' })).toBeInTheDocument();
    expect(getByRole('textbox', { name: 'Email' })).toBeInTheDocument();
  });
});
